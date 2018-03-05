var db = require('../models'),
	cheerio = require('cheerio'),
	express = require('express'),
	axios = require('axios'),
	async = require('async'),
	scrape = require('../scripts/scrape'),
	router = express.Router();

// Scrapes the Onion
router.get('/', function(req, res) {
	scrape(function(result) {
		res.json(result);
	});
});

module.exports = router;