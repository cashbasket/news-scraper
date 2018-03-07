# Scraped Onion

**Scraped Onion** is a website written in JavaScript (Node.js w/ Express.js, Handlebars, Mongoose, etc.) that scrapes _[The Onion](https://www.theonion.com)_'s homepage, stores the newly-scraped articles in a database, and allows people to write notes about the articles.  That might not make a lot of sense to you right now, and it may never, but let's just go with it.

## How to Use

Upon [visiting the site](https://scraped-onion.herokuapp.com), any _Onion_ articles that are not yet in the database will immediately be scraped, added to the "articles" collection in the database, and displayed on the site. Scraping can also be initiated manually by clicking the "Scrape More Onion" button in the nav bar (upper-right corner on desktop, dropdown menu on mobile).  It will do the exact same thing that happens when you first visit (or reload) the site.

## Local Installation

To run the site locally, you'll need to have MongoDB and Node.js installed on your machine.  Once that's done, navigate to the project folder in Terminal or Bash or whatever you use and type `npm install` to install the dependencies used for this project.

Before you get the web server up and running, you should start Mongo Daemon process first; otherwise, the web server won't have a database to connect to. All you need to do is type `mongod` and the Mongo daemon will take care of the rest. You will see a bunch of tasteful gibberish on your screen, but that is what you _should_ be seeing, so don't worry.

To start the server, type `node server`, and to view the local site, visit `http://localhost:3000`. Any articles on the _Onion_ homepage that aren't in your local database - which is all of them, at first - will be scraped, added to the database, and displayed on the site.  Good deal.

## Future Plans

I plan on adding user authentication to this project (probably w/ Passport.js) as soon as possible.  Otherwise, chaos will ensue.  CHAOS, I tell you!