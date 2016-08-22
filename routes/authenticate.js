//Google API authentication
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

//Credentials
var client_secret = require('../client_secret.json');
var CLIENT_ID = client_secret.web.client_id;
var CLIENT_SECRET = client_secret.web.client_secret;
var REDIRECT_URL = client_secret.web.redirect_uris[0];

//Create client
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
  'https://www.googleapis.com/auth/calendar'
];

//Redirects to authentication page via google
function getAccessToken(res) {
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: scopes
  });

  res.redirect(url);
}

//Set client tokens. Redirects to new calendar on completion.
function setToken(tokenCode, res) {
  var url = '/error';
  oauth2Client.getToken(tokenCode, function(err, tokens) {
    if(err){
      console.log("Error setting client token - failed to authenticate");
      res.redirect(url);
    }
    else{
      oauth2Client.setCredentials(tokens);
      url = '/new_bu_calendar';
      res.redirect(url);
    }
  });
}

module.exports = {
  api: google,
  client: oauth2Client,
  getAccessToken: getAccessToken,
  setToken: setToken
}
