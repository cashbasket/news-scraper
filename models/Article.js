var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	link: {
		type: String,
		required: true
	},
	excerpt: {
		type: String,
		required: false
	},
	image: {
		type: String,
		required: false
	},
	postedAt: {
		type: Date,
		required: true
	},
	scrapedAt: {
		type: Date,
		default: Date.now,
		required: true
	},
	notes: [{
		type: Schema.Types.ObjectId,
		ref: 'Note'
	}]
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
