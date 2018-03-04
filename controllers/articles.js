var db = require('../models'),
	express = require('express'),
	router = express.Router();

// gets all the articles
router.get('/', function(req, res) {
	db.Article.find({})
		.sort([['postedAt', -1]])
		.then(function(articles) {
			var articlesObj = {
				articles: articles
			};
			res.render('home', articlesObj);
		});
});

// returns an article with its note
router.get('/articles/:id', function(req, res) {
	db.Article.findById(req.params.id)
		.populate('note')
		.then(function(article) {
			
			res.json(article);
		});
});

// creates or updates an article's note
router.post('/articles/:id', function(req, res) {
	// Create a new note and pass the req.body to the entry
	db.Note.create({
		title: req.body.title,
		body: req.body.body
	}).then(function(dbNote) {
		return db.Article.findOneAndUpdate({ 
			_id: req.params.id 
		}, { 
			note: dbNote._id 
		}, { 
			new: true 
		});
	}).then(function(dbArticle) {
		res.json(dbArticle);
	}).catch(function(err) {
		res.json(err);
	});
});

module.exports = router;
