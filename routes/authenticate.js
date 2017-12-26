//Google API authentication
var google = require('googleapis')
var OAuth2 = google.auth.OAuth2

//Credentials
var client_secret = require('../client_secret.json')
var CLIENT_ID = client_secret.installed.client_id
var CLIENT_SECRET = client_secret.installed.client_secret
var REDIRECT_URL =  "http://localhost:3000/oauth/callback"//client_secret.installed.redirect_uri[0]
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
  'https://www.googleapis.com/auth/calendar'
]

// Redirects to authentication page via google
function getAccessToken (res) {
  var url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: scopes
  })

  return res.redirect(url)
}

// Set client tokens. Redirects to new calendar on completion.
function setToken (tokenCode, res) {
  var url = '/error'
  oauth2Client.getToken(tokenCode, function (err, tokens) {
    if (err) {
      console.log('Error setting client token - failed to authenticate')
      return res.redirect(url)
    } else {
      oauth2Client.setCredentials(tokens)
      url = '/new_bu_calendar'
      return res.redirect(url)
    }
  })
}

module.exports = {
  api: google,
  client: oauth2Client,
  getAccessToken: getAccessToken,
  setToken: setToken
}
