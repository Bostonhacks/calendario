const calendarAPI = require('../authenticate').api.calendar('v3')
const debug = require('debug')('lib:calendar:insert')
const moment = require('moment-timezone')

const endDate = require('config').get('classes.endDate')
const parse = require('./parse')
const clean = require('./clean')

const tz = 'America/New_York'
const UNTIL_DATE_STR = moment.tz(endDate, 'MM-DD-YYYY', tz).add(1, 'day').format('YYYYMMDD')

// Inserts a calendar given the url querystring.
// We need to:
// 1) Create a calendar and get its id
// 2) Insert every single class into that calendar
// 3) Get a list of all the classes for holidays/days off
// 4) Move monday classes to tuesday
// 5) Delete break days
// 6) Add bu academic calendar stuff like finals, commencement

function insert (query) {
  return createCalendar(query)
    .then(parse.createClassArray)
    .then(insertClasses)
    .then((calendarIdArr) => {
      debug('Completed class insertion!')
      return calendarIdArr[0]
    })
    .then(clean.cleanClasses)
    .then(() => {
      debug('Completed class cleaning!')
    })
}

// Expects hash with calendarId and classes[] keys
function insertClasses (params) {
  debug(params)
  let classInserts = []
  let classes = params.classes

  for (let i = 0; i < classes.length; i++) {
    classInserts.push(insertClass({
      calendarId: params.calendarId,
      class: classes[i]
    }))
  }

  return Promise.all(classInserts)
}

function insertClass (details) {
  return new Promise((resolve, reject) => {
    let startDateTime = parse.getStartDate(details.class.weekday, details.class.startTime)
    let endDateTime = parse.getStartDate(details.class.weekday, details.class.endTime)

    debug(startDateTime)
    debug(endDateTime)

    let event = {
      'summary': details.class.name,
      'start': {
        'dateTime': startDateTime,
        'timeZone': tz
      },
      'end': {
        'dateTime': endDateTime,
        'timeZone': tz
      },
      'recurrence': [
        'RRULE:FREQ=WEEKLY;UNTIL=' + UNTIL_DATE_STR
      ]
    }

    debug(event)

    calendarAPI.events.insert({
      calendarId: details.calendarId,
      resource: event
    }, (err, event) => {
      if (err) {
        debug('Error on inserting class: ' + details.class.name + ' error: ' + err)
        return reject(err)
      }
      resolve(details.calendarId)
    })
  })
}

function createCalendar (query) {
  return new Promise((resolve, reject) => {
    let calendarName = query.name || 'BU Calendar Import'

    calendarAPI.calendars.insert({
      'resource': {
        'summary': calendarName,
        'timeZone': tz
      }
    }, (err, cal) => {
      if (err) {
        debug('Error creating calendar - ' + err)
        return reject(err)
      }
      debug('Calendar created - ' + cal)

      delete query.name
      query.calendarId = cal.id
      resolve(query)
    })
  })
}

module.exports = { insert }
