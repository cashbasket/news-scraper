var db = require('../models'),
	cheerio = require('cheerio'),
	express = require('express'),
	axios = require('axios'),
	async = require('async'),
	router = express.Router();

// Scrapes the Onion
router.get('/', function(req, res) {
	var i = 0;
	axios.get('http://www.theonion.com').then(function(response) {
		var $ = cheerio.load(response.data);
		var articleDiv = $('.post-wrapper > article');
		var articles = [];
		articleDiv.each(function(i, element) {
			var link = $(element).children('header').children('h1').children('a').attr('href');
			var title = $(element).children('header').children('h1').children('a').text();
			var excerpt = $(element).children('div.item__content').children('.excerpt').text();
			var image = $(element).children('div.item__content').children('figure').children('a').children('div.img-wrapper').children('picture').children('source').attr('data-srcset');
			var postedAt = $(element).children('header').children('div.meta--pe').children('div.meta__container').children('time').attr('datetime');

			var article = {
				title: title,
				link: link,
				excerpt: excerpt,
				image: image,
				postedAt: postedAt
			};
			articles.push(article);
		});

		var calls = [];
		var newArticles = [];

		articles.forEach(function(article) {
			calls.push(function(callback) {
				db.Article.findOne({
					link: article.link
				}).then(function(result) {
					if (!result) // if there is no article in the db with that link, it is a new article
						newArticles.push(article);
					callback(null, article);
				});
			});
		});

		async.parallel(calls, function(err, result) {
			if (err)
				return console.log(err);
			db.Article.insertMany(newArticles)
				.then(function(inserted) {
					res.json(inserted);
				}).catch(function(err) {
					res.json(err);
				});
		});		
	});
});

module.exports = router;