const debug = require('debug')('lib:authenticate')
const google = require('googleapis')
const OAuth2 = google.auth.OAuth2

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URL = process.env.GOOGLE_REDIRECT_URL
const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

const scopes = [
  'https://www.googleapis.com/auth/calendar'
]

google.options({
  auth: oauth2Client
})

function getAccessToken (res) {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  })

  return res.redirect(url)
}

function setToken (tokenCode, res) {
  oauth2Client.getToken(tokenCode, function (err, tokens) {
    if (err) {
      debug('Error setting client token - failed to authenticate')
      return res.redirect('/error')
    } else {
      oauth2Client.setCredentials(tokens)
      return res.redirect('/new_bu_calendar')
    }
  })
}

module.exports = {
  api: google,
  client: oauth2Client,
  getAccessToken: getAccessToken,
  setToken: setToken
}
