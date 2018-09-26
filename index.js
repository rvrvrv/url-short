require('dotenv').config();
const express = require('express');
const path = require('path');

const indexPage = path.join(`${__dirname}/index.html`);
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 8080;
const urlOps = require('./urlOps'); // My URL functions

// Connect to DB
mongoose.connect(process.env.DB, { useMongoClient: true });

// URL Schema
const UrlSchema = mongoose.Schema({
  long: String,
  short: {
    type: String,
    index: true
  }
});

// URL Model
const UrlEntry = mongoose.model('urlEntry', UrlSchema);

// Long URL
app.get('/new/*', (req, res) => {
  const longUrl = req.params[0];
  // Check URL validity
  if (!urlOps.validUrl(longUrl)) {
    return res.json({
      original_url: 'Invalid URL',
      short_url: 'Short URL not created',
    });
  }

  // Check for existing long URL
  return UrlEntry.findOne({
    long: longUrl,
  }, (err, obj) => {
    if (err) return res.sendFile(indexPage);
    // If it exists, return URLs to user
    if (obj) {
      return res.json({
        original_url: obj.long,
        short_url: process.env.HOST + obj.short,
      });
    }
    // If URL doesn't exist, add to DB
    const newUrl = new UrlEntry({
      long: longUrl,
      short: urlOps.shortify(longUrl),
    });

    return newUrl
      .save()
      .then((url) => {
        res.json({
          original_url: longUrl,
          short_url: process.env.HOST + url.short
        });
      });
  });
});

// Landing page
app.get('/index.html', (req, res) => res.sendFile(indexPage));

// Short URL Redirection
app.get('/*', (req, res) => {
  const shortUrl = req.params[0];
  // Search for URL in DV
  UrlEntry.findOne({
    short: shortUrl,
  }, (err, obj) => {
    if (err) return res.sendFile(indexPage);
    // If URL exists, redirect user to long URL
    return obj
      ? res.redirect(urlOps.makeFullUrl(obj.long))
      : res.sendFile(indexPage); // Otherwise, redirect to index.html
  });
});

app.listen(port, () => console.log(`Server is listening on port ${port}`));

exports.default = UrlEntry; // For use in urlOps.js
