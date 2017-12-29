const express = require('express')
const router = express.Router()
const authenticate = require('../lib/authenticate.js')
const insert = require('../lib/insert.js')
const clean = require('../lib/clean.js')
const debug = require('debug')('routes:index')

router.get('/', function (req, res, next) {
  res.render('index')
})

router.get('/new_bu_calendar/', function (req, res, next) {
  res.render('new_bu_calendar')
})

router.get('/classes/', function (req, res, next) {
  insert.insertCalendar(req.query.name, req.query, function (err, calId) {
    if (err) {
      return res.redirect('/error')
    } else {
      debug('Inserted complete. Cleaning cal')
      clean.cleanUp(calId, function (err) {
        if (err) {
          return res.redirect('/error')
        } else {
          return res.redirect('/end')
        }
      })
    }
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
