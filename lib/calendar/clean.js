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
  deleteClasses(calendarId)
    .then(moveClasses(calendarId))
    .catch(err => {
      
    })
}

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

function moveClasses (calendarId) {

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

function moveDay (calendarId, day, newDateTime) {
  return new Promise((resolve, reject) => {

  })
}

module.exports = { cleanClasses }
