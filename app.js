const express = require('express')
const path = require('path')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const debug = require('debug')('app')
const routes = require('./routes/index')
const fs = require('fs')
const rfs = require('rotating-file-stream')

const app = express()

// Logging
const logDir = path.join(__dirname, 'log')
fs.existsSync(logDir) || fs.mkdirSync(logDir)

const accessLogStream = rfs('access.log', {
  interval: '7d',
  path: logDir
})

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.set('port', process.env.PORT || 3000)

if (process.env.ENV === 'DEV') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined', {
    stream: accessLogStream
  }))
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

const server = app.listen(function () {
  let host = server.address().address
  let port = server.address().port

  debug('Calendar listening at http://%s:%s', host, port)
})

module.exports = app
