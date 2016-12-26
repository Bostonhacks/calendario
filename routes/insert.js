var async = require('async')
var debug = require('debug')('insert')
// Authentication
var authenticate = require('./authenticate.js')
var oauth2Client = authenticate.client
var calendarAPI = authenticate.api.calendar('v3')

var parser = require('./parse.js')

const UNTIL_DATE = '20170503T120000Z'

function insertCalendar (req, res) {
  calendarAPI.calendars.insert({
    auth: oauth2Client,
    'resource': {
      'summary': req.query.name
    }
  }, function (err, calendarCreated) {
    if (err) {
      debug('CREATE CALENDAR ERROR ' + err)
      return res.redirect('/error')
    }
    debug('New calendar created - ')
    debug('calendarId:' + calendarCreated.id)
    insertClasses(req, res, calendarCreated)
  })
}

function insertClasses (req, res, calendarCreated) {
  var classArray = parser.createClassArray(req)
  async.forEach(classArray, insertClass.bind(insertClass, calendarCreated),
    function (err) {
      if (err) {
        debug('Error on class insertion ' + err)
        return res.redirect('/error')
      } else {
        debug('Completed class insertion!')
        return res.redirect('/clean?cid=' + calendarCreated.id)
      }
    })
}

var insertClass = function (calendarCreated, arrayIndex, callback) {
  var startDate = parser.getWeekDay(arrayIndex.d)
  var startDateTime = parser.setDateTimeFormat(arrayIndex.tb, startDate)
  var endDateTime = parser.setDateTimeFormat(arrayIndex.te, startDate)

  var event = {
    'summary': arrayIndex.c,
    'start': {
      'dateTime': startDateTime,
      'timeZone': 'America/New_York'
    },
    'end': {
      'dateTime': endDateTime,
      'timeZone': 'America/New_York'
    },
    'recurrence': [
      'RRULE:FREQ=WEEKLYUNTIL=' + UNTIL_DATE
    ]
  }

  calendarAPI.events.insert({
    auth: oauth2Client,
    calendarId: calendarCreated.id,
    resource: event
  }, function (err, event) {
    if (err) {
      debug('Error on insert')
      return callback(err)
    } else {
      return callback()
    }
  })
}

module.exports = {
  insertCalendar: insertCalendar
}
