const calendarAPI = require('../authenticate.js').api.calendar('v3')
const debug = require('debug')('lib:calendar:clean')

const listQuery = {
  // calendarId: { newCalendarId },
  orderBy: 'startTime',
  singleEvents: true,
  // timeMax: { ISO_DATETIME },
  // timeMin: { ISO_DATETIME },
  fields: 'items(description,id,summary, start, end)' // TODO: can probably remove all but id, start, end
}

function cleanClasses (calendarId) {
  return new Promise((resolve, reject) => {

  })
}

function getClasses (startDateTime, endDateTime) {
  return new Promise((resolve, reject) => {
    let query = Object.clone(listQuery).assign({
      timeMin: startDateTime,
      timeMax: endDateTime
    })

    calendarAPI.events.list(query, (err, events) => {
      if (err) {
        debug('Error on retrieving classes' + err)
        return reject(err)
      }

      resolve(events)
    })
  })
}

function deleteClasses (events) {
  let classArray = []

  for (let i = 0; i < events.length; i++) {
    classArray.push(deleteClass(events[i]))
  }

  return Promise.all(classArray)
}

function deleteClass (event) {
  return new Promise((resolve, reject) => {

  })
}

// TODO: Add param for target date
function moveClasses (events) {
  let classArray = []

  for (let i = 0; i < events.length; i++) {
    classArray.push(moveClass(events[i]))
  }

  return Promise.all(classArray)
}

function moveClass (event, newDateTime) {
  return new Promise((resolve, reject) => {

  })
}

module.exports = { cleanClasses }
