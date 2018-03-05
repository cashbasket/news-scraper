var db = require('../models'),
	mongoose = require('mongoose'),
	express = require('express'),
	scraper = require('../scripts/scrape'),
	router = express.Router();

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

router.post('/', function(req, res) {
	scraper(function(inserted) {
		req.session.sessionFlash = {
			type: inserted.length > 0 ? 'success' : 'danger',
			message: inserted.length > 0 ? 'Added ' + inserted.length + ' new articles.' : 'No new articles were found.'
		};
		req.session.save(function(err) {
			res.redirect(301, '/');
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

// creates or updates an article's note
router.post('/articles/:id', function(req, res) {
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