const calendarAPI = require('../authenticate.js').api.calendar('v3')
const debug = require('debug')('lib:calendar:clean')

const tz = process.env.TIMEZONE || 'America/New_York'

const listQuery = {
  calendarId: newCalendarId,
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

function MOVE_FEB_20_TO_21 (callback) {
      var items = eventList.items
      // this to fix time zone difference for late night classes
      for (var i = 0, len = items.length; i < len; i++) {
        var startPrefix = '2017-02-21'
        var endPrefix = '2017-02-21'
        if (items[i].start.dateTime.substring(11, 13) === '00' || items[i].start.dateTime.substring(11, 13) === '01' || items[i].start.dateTime.substring(11, 13) === '02') {
          startPrefix = '2017-02-22'
        }
        if (items[i].end.dateTime.substring(11, 13) === '00' || items[i].end.dateTime.substring(11, 13) === '01' || items[i].end.dateTime.substring(11, 13) === '02') {
          endPrefix = '2017-02-22'
        }

        var newStartDateTime = startPrefix + items[i].start.dateTime.substring(10)
        var newEndDateTime = endPrefix + items[i].end.dateTime.substring(10)

        var newDateTime = {
          'end': {
            'dateTime': newEndDateTime,
            'timeZone': tz
          },
          'start': {
            'dateTime': newStartDateTime,
            'timeZone': tz
          },
          'summary': items[i].summary
        }
        calendarAPI.events.update({
      
          calendarId: newCalendarId,
          eventId: items[i].id,
          resource: newDateTime
        }, function (err) {
          if (err) {
            debug('Error updating 02/20->02/21 ' + err)
            return callback(err)
          }
        })
      }
      return callback(null)
    }
  })
}

function DELETE_SPR_BREAK (callback) {
      var items = eventList.items
      for (var i = 0, len = items.length; i < len; i++) {
        calendarAPI.events.delete({
      
          calendarId: newCalendarId,
          eventId: items[i].id
        }, function (err) {
          if (err) {
            debug('Error deleting spr_break ' + err)
            return callback(err)
          } else {
            return callback(null)
          }
        })
      }
    }
  })
}

function MOVE_APR_17_TO_19 (callback) {
      var items = eventList.items
      // this to fix time zone difference for late night classes
      for (var i = 0, len = items.length; i < len; i++) {
        var startPrefix = '2017-04-19'
        var endPrefix = '2017-04-19'
        if (items[i].start.dateTime.substring(11, 13) === '00' || items[i].start.dateTime.substring(11, 13) === '01' || items[i].start.dateTime.substring(11, 13) === '02') {
          startPrefix = '2017-04-20'
        }
        if (items[i].end.dateTime.substring(11, 13) === '00' || items[i].end.dateTime.substring(11, 13) === '01' || items[i].end.dateTime.substring(11, 13) === '02') {
          endPrefix = '2017-04-20'
        }

        var newStartDateTime = startPrefix + items[i].start.dateTime.substring(10)
        var newEndDateTime = endPrefix + items[i].end.dateTime.substring(10)

        var newDateTime = {
          'end': {
            'dateTime': newEndDateTime,
            'timeZone': tz
          },
          'start': {
            'dateTime': newStartDateTime,
            'timeZone': tz
          },
          'summary': items[i].summary
        }

        calendarAPI.events.update({
      
          calendarId: newCalendarId,
          eventId: items[i].id,
          resource: newDateTime
        }, function (err) {
          if (err) {
            debug('Error updating 04/17->04/19 ' + err)
            return callback(err)
          }
        })
      }
      return callback(null, 'Done cleaning dates!')
    }
  })
}

module.exports = { cleanClasses }
