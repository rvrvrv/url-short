const index = require('./index');

// Ensure full URL for proper redirection
const makeFullUrl = (url) => {
  const protocol = /^(?:http(s)?:\/\/)/i; // Check for http(s):// at beginning of URL
  return (protocol.test(url)) ? url : `https://${url}`; // Prepend https:// when necessary
};

// Validate long URL (user's entry)
const validUrl = (longUrl) => {
  const regEx = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:\/?#[\]@!\$&'\(\)\*\+,;=.]+$/i;
  return regEx.test(longUrl);
};

// Check for existing URL
const urlExists = (url) => {
  const UrlEntry = index.default;
  // Search for long URL in DB
  UrlEntry.findOne({ short: url }, (obj) => {
    // If object exists, return short URL
    return obj ? obj.short : false;
  });
};

// Shortening operation
const shortify = (longUrl) => {
  // Generate random number
  const shortUrl = Math.floor(Math.random() * 9998 + 1).toString();
  // If random number (short URL) doesn't exist in DB, use it
  if (!urlExists('short', shortUrl)) return shortUrl;
  // Otherwise, try again
  return shortify(longUrl);
};

module.exports = {
  makeFullUrl,
  validUrl,
  urlExists,
  shortify
};
