require('dotenv').config();
var express = require('express'); //ExpressJS
var urlOps = require('./urlOps'); //My URL functions
var path = require('path'); //For pointing to files
var indexPage = path.join(__dirname + '/index.html');
var mongoose = require('mongoose'); //DB ops
var app = express(); //Server Setup
var port = process.env.PORT || 8080; //Set port

//Connect to DB
mongoose.connect(process.env.DB);

//URL Schema
var UrlSchema = mongoose.Schema({
    long: String,
    short: {
        type: String,
        index: true
    }
});

//URL Model
var urlEntry = mongoose.model('urlEntry', UrlSchema);

//Long URL
app.get('/new/*', function(req, res) {
    var longUrl = req.params[0];
    //Check URL validity
    if (!urlOps.validUrl(longUrl)) {
        return res.json({
            original_url: 'Invalid URL',
            short_url: 'Short URL not created'
        });
    }
    else {
        //Check for existing long URL
        urlEntry.findOne({
            long: longUrl
        }, function(err, obj) {
            if (err) return res.sendFile(indexPage);
            //If it exists, return URLs to user
            if (obj) return res.json({
                original_url: obj.long,
                short_url: process.env.HOST + obj.short
            });
            //If it doesn't exist, add to DB
            else {
                var newUrl = new urlEntry({
                    long: longUrl,
                    short: urlOps.shortify(longUrl)
                });
                newUrl.save().then(function(newUrl) {
                    return res.json({
                        original_url: longUrl,
                        short_url: process.env.HOST + newUrl.short
                    });
                });
            }

        });

    }
});


//Landing page
app.get('/index.html', function(req, res) {
    return res.sendFile(indexPage);
});


//Short URL Redirection
app.get('/*', function(req, res) {
    var shortUrl = req.params[0];
    urlEntry.findOne({
        short: shortUrl
    }, function(err, obj) {
        if (err) return res.sendFile(indexPage);
        //If it exists, redirect the user
        if (obj) res.redirect(urlOps.makeFullUrl(obj.long));
        //If it doesn't exist, tell the user
        else return res.sendFile(indexPage);
    });
});


app.listen(port, function() {
    console.log('Server is listening on port ' + port);
});

exports.urlEntry = urlEntry; //For use in urlOps.js
