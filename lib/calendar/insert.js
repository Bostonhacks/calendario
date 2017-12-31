const calendarAPI = require('../authenticate').api.calendar('v3')
const debug = require('debug')('lib:calendar:insert')

const parse = require('./parse')
const clean = require('./clean')

const UNTIL_DATE = process.env.UNTIL_DATE || '20180510T120000Z'
const tz = process.env.TIMEZONE || 'America/New_York'

// Inserts a calendar given the url querystring.
// We need to:
// 1) Create a calendar and get its id
// 2) Insert every single class into that calendar
// 3) Get a list of all the classes for holidays/days off
// 4) Move monday classes to tuesday
// 5) Delete break days
// 6) Add bu academic calendar stuff like finals, commencement

function insert (query) {
  return new Promise((resolve, reject) => {
    createCalendar(query)
      .then(parse.createClassArray)
      .then(insertClasses)
      .then((calendarIdArr) => {
        debug('Completed class insertion!')
        return calendarIdArr[0]
      })
      .then(clean.cleanClasses)
      .then(() => {
        debug('Completed class cleaning!')
        resolve()
      })
      .catch(err => {
        debug('Error on class insertion ' + err)
        reject(err)
      })
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
    let startTime = parse.getDateTime(details.class.startDate, details.class.startTime)
    let endTime = parse.getDateTime(details.class.startDate, details.class.endTime)

    debug(startTime)
    debug(endTime)

    let event = {
      'summary': details.class.name,
      'start': {
        'dateTime': startTime,
        'timeZone': tz
      },
      'end': {
        'dateTime': endTime,
        'timeZone': tz
      },
      'recurrence': [
        'RRULE:FREQ=WEEKLY;UNTIL=' + UNTIL_DATE
      ]
    }

    debug(event)

    // TODO: change weekday recurrence
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
