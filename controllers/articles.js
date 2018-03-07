var db = require('../models'),
	mongoose = require('mongoose'),
	express = require('express'),
	scraper = require('../scripts/scrape'),
	RateLimit = require('express-rate-limit'),
	router = express.Router();

var rateLimiter = new RateLimit({
	windowMs: 15*60*1000, // 15 minutes
	max: 30,
	delayMs: 0,
	message: 'So, you\'re either scraping too much or posting WAY too many notes.  Try again in 15 minutes.'
});

function nocache(req, res, next) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
}

// gets all the articles
router.get('/', function(req, res) {
	db.Article.find({})
		.populate('notes')
		.sort([['postedAt', -1]])
		.then(function(articles) {
			var articlesObj = {
				articles: articles
			};
			res.render('home', articlesObj);
		});
});

router.get('/scrape', rateLimiter, nocache, function(req, res) {
	scraper(function(inserted) {
		var manual = req.query.manual === 'true' ? true : false;
		req.session.sessionFlash = {
			type: inserted.length > 0 ? 'success' : 'info',
			message: inserted.length > 0 ? 'Just scraped' + inserted.length + ' new articles!' : ( manual ? 'No new articles to scrape.' : 'Everything\'s up-to-date!')
		};
		req.session.save(function(err) {
			res.json(inserted);
		});
	});
});

// returns an article with its note
router.get('/articles/:id', function(req, res) {
	db.Article.findById(req.params.id)
		.populate('notes')
		.then(function(article) {
			res.json(article);
		});
});

// creates a note
router.post('/articles/:id', rateLimiter, function(req, res) {
	var newNote;
	db.Note.create({
		name: req.body.name,
		body: req.body.body
	}).then(function(note) {
		newNote = note;
		return db.Article.findOneAndUpdate({ 
			_id: req.params.id 
		}, { 
			$push: { notes: note } 
		}, { 
			new: true 
		});
	}).then(function(article) {
		res.json(newNote);
	}).catch(function(err) {
		res.json(err);
	});
});

// deletes a note
router.delete('/articles/:articleId/:noteId', function(req, res) {
	db.Note.findByIdAndRemove(req.params.noteId)
		.then(function(note) {
			return db.Article.findOne({
				_id: req.params.articleId
			}).then(function(article) {
				article.notes.remove(mongoose.Types.ObjectId(req.params.noteId));
				article.save();
				res.json(article);
			}).catch(function(err) {
				res.json(err);
			});
		});
});

module.exports = router;