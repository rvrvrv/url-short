var index = require('./index');

//Shortening operation
var shortify = function(longUrl) {
    //Generate random number
    var shortUrl = Math.floor(Math.random() * 9998 + 1).toString();
    //If random number (short URL) doesn't exist in DB, use it
    if (!urlExists('short', shortUrl)) return shortUrl;
    //Otherwise, try again
    else return shortify(longUrl);
};


//Check for existing URL
var urlExists = function(url) {
    //Search for long URL in DB
    index.urlEntry.findOne({
        short: url
    }, function(obj) {
        //If no document, return false
        if (!obj) {
            return false;
        }
        //Otherwise, return short URL
        else {
            return obj.short;
        }
    });
};

//Validate long URL (user's entry)
var validUrl = function(longUrl) {
    var regEx = /((http|https)\:\/\/)?[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\&\.\/\?\:@\-_=#])*/;
    return regEx.test(longUrl);
};

//Ensure full URL for proper redirection
var makeFullUrl = function(url) {
    var regEx2 = /^(http|https):\/\//; //HTTP or HTTPS at beginning of URL
    if (!regEx2.test(url)) return 'https://' + url;
    else return url;
};


exports.shortify = shortify;
exports.urlExists = urlExists;
exports.validUrl = validUrl;
exports.makeFullUrl = makeFullUrl;
