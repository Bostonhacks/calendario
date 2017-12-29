const google = require('googleapis')
const OAuth2 = google.auth.OAuth2

// Credentials
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URL = process.env.REDIRECT_URL
const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

const scopes = [
  'https://www.googleapis.com/auth/calendar'
]

function getAccessToken (res) {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
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
