const calendarAPI = require('../authenticate.js').api.calendar('v3')
const debug = require('debug')('lib:calendar:clean')

const moment = require('moment-timezone')
const tz = 'America/New_York'

const config = require('config')

// need to parse stringified config because arrays get destroyed
const deleteDays = config.get('classes.modify.delete')
const moveDays = config.get('classes.modify.move')
const createDays = config.get('classes.modify.create')

const listQuery = {
  // calendarId: { newCalendarId },
  singleEvents: true
  // timeMax: { ISO_DATETIME },
  // timeMin: { ISO_DATETIME },
}

function cleanClasses (calendarId) {
  return new Promise((resolve, reject) => {
    // TODO The .bind() feels like a hack but it works
    deleteClasses(calendarId)
      .then(moveClasses.bind(this, calendarId))
      .then(createClasses.bind(this, calendarId))
      .catch(err => {
        if (err) {
          debug(err)
          reject(err)
        } else {
          resolve()
        }
      })
  })
}

function moveClasses (calendarId) {
  let classArray = []

  for (const day of Object.keys(moveDays)) {
    classArray.push(moveDay(calendarId, moveDays[day]))
  }

  return Promise.all(classArray)
}

function createClasses (calendarId) {
  let classArray = []

  // for (const day of Object.keys(createDays)) {
  //   classArray.push(createDay(calendarId, deleteDays[day]))
  // }

  return Promise.all(classArray)
}

function moveDay (calendarId, day) {
  let start = moment.tz(day.startDate, 'MM-DD-YYYY', tz)
  let end = moment.tz(day.endDate, 'MM-DD-YYYY', tz).add(1, 'day')

  let dayOffset = moment.tz(day.targetStartDate, 'MM-DD-YYYY', tz).diff(start, 'days')

  getClasses(calendarId, start.toISOString(true), end.toISOString(true))
    .then(events => {
      let moveEvents = []

      let items = events.items
      for (let index = 0; index < items.length; index++) {
        moveEvents.push(moveEvent(calendarId, items[index], dayOffset))
      }

      return Promise.all(moveEvents)
    })
    .catch(err => {
      debug(err)
      return Promise.reject(err)
    })
}

function moveEvent (calendarId, event, dayOffset) {
  return new Promise((resolve, reject) => {
    let newStart = moment.tz(event.start.dateTime, tz).add(dayOffset, 'days')
    let newEnd = moment.tz(event.end.dateTime, tz).add(dayOffset, 'days')

    let query = {
      calendarId: calendarId,
      eventId: event.id,
      resource: {
        start: {
          dateTime: newStart.toISOString(true),
          timeZone: tz
        },
        end: {
          dateTime: newEnd.toISOString(true),
          timeZone: tz
        },
        summary: event.summary
      }
    }

    calendarAPI.events.update(query, (err) => {
      if (err) {
        debug('Error on updating event' + err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

// function createDay(calendarId, day) {
//   let start = moment.tz(day.startDate, 'MM-DD-YYYY', tz).toISOString(true)
//   let end = moment.tz(day.endDate, 'MM-DD-YYYY', tz).add(1, 'day').toISOString(true)
// }

function deleteClasses (calendarId) {
  let classArray = []

  for (const day of Object.keys(deleteDays)) {
    classArray.push(deleteDay(calendarId, deleteDays[day]))
  }

  return Promise.all(classArray)
}

function deleteDay (calendarId, day) {
  let start = moment.tz(day.startDate, 'MM-DD-YYYY', tz).toISOString(true)
  let end = moment.tz(day.endDate, 'MM-DD-YYYY', tz).add(1, 'day').toISOString(true)

  getClasses(calendarId, start, end)
    .then(events => {
      let deleteEvents = []

      let items = events.items
      for (let index = 0; index < items.length; index++) {
        deleteEvents.push(deleteEvent(calendarId, items[index].id))
      }

      return Promise.all(deleteEvents)
    })
    .catch(err => {
      debug(err)
      return Promise.reject(err)
    })
}

function deleteEvent (calendarId, eventId) {
  return new Promise((resolve, reject) => {
    let query = {
      calendarId: calendarId,
      eventId: eventId
    }

    calendarAPI.events.delete(query, (err) => {
      if (err) {
        debug('Error on deleting event' + err + ' id: ' + eventId)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

function getClasses (calendarId, startDateTime, endDateTime) {
  return new Promise((resolve, reject) => {
    let query = Object.assign({
      calendarId: calendarId,
      timeMin: startDateTime,
      timeMax: endDateTime
    }, listQuery)

    calendarAPI.events.list(query, (err, events) => {
      if (err) {
        debug('Error on retrieving classes' + err)
        return reject(err)
      }

      resolve(events)
    })
  })
}

module.exports = { cleanClasses }
