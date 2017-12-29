const async = require('async')
const debug = require('debug')('routes:insert')
const authenticate = require('../lib/authenticate')
const oauth2Client = authenticate.client
const calendarAPI = authenticate.api.calendar('v3')

const parser = require('./parse')

const UNTIL_DATE = '20170503T120000Z'

function insertCalendar (calendarName, query, callback) {
  calendarAPI.calendars.insert({
    auth: oauth2Client,
    'resource': {
      'summary': calendarName
    }
  }, function (err, calendarCreated) {
    if (err) {
      debug('CREATE CALENDAR ERROR ' + err)
      return callback(err)
    } else {
      debug('New calendar created - ')
      debug('calendarId:' + calendarCreated.id)
      return insertClasses(calendarCreated, query, callback)
    }
  })
}

function insertClasses (calendarCreated, query, callback) {
  var classArray = parser.createClassArray(query)
  async.forEach(classArray, insertClass.bind(insertClass, calendarCreated),
    function (err) {
      if (err) {
        debug('Error on class insertion ' + err)
        return callback(err)
      } else {
        debug('Completed class insertion!')
        return callback(null, calendarCreated.id)
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
      'RRULE:FREQ=WEEKLY;UNTIL=' + UNTIL_DATE
    ]
  }

  calendarAPI.events.insert({
    auth: oauth2Client,
    calendarId: calendarCreated.id,
    resource: event
  }, function (err, event) {
    if (err) {
      debug('Error on insert' + err)
      return callback(err)
    } else {
      return callback()
    }
  })
}

module.exports = {
  insertCalendar: insertCalendar
}
