var express   = require('express'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	exphbs = require('express-handlebars'),
	handlebars = require('./helpers/handlebars')(exphbs);

var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/scrapedOnion';

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var app = express();
var PORT = process.env.PORT || 3000;

app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, for instance)

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set Handlebars as the default templating engine.
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// Import controllers
var fetch = require('./controllers/fetch');
app.use('/fetch', fetch);

var articles = require('./controllers/articles');
app.use(articles);

app.listen(PORT, function() {
	console.log('Listening on port %s', PORT);
});