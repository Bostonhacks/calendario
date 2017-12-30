const express = require('express')
const router = express.Router()
const authenticate = require('../lib/authenticate')
const calendar = require('../lib/calendar')
const debug = require('debug')('routes:index')

router.get('/', function (req, res, next) {
  res.render('index')
})

router.get('/new_bu_calendar/', function (req, res, next) {
  res.render('new_bu_calendar')
})

router.get('/classes/', function (req, res, next) {
  debug('query: ' + JSON.stringify(req.query))
  calendar
    .insert(req.query)
    .then(msg => {

    })
    .catch(err => {
      debug(err)
      // TODO: handle err
    })
})

router.get('/google/auth/', function (req, res) {
  return authenticate.getAccessToken(res)
})

router.get('/google/authcomplete/', function (req, res) {
  return authenticate.setToken(req.query.code, res)
})

router.get('/instructions', function (req, res) {
  return res.render('instructions')
})

router.get('/end', function (req, res, next) {
  return res.render('end')
})

module.exports = router
