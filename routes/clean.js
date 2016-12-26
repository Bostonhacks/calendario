// Authentication
var authenticate = require('./authenticate.js')
var oauth2Client = authenticate.client
var calendarAPI = authenticate.api.calendar('v3')
var newCalendarId = null

var debug = require('debug')('clean')

const FEB_20_START = '2017-02-20T00:00:00-05:00'
const FEB_20_END = '2017-02-20T23:00:00-05:00'
const FEB_21_START = '2017-02-21T00:00:00-05:00'
const FEB_21_END = '2017-02-21T23:00:00-05:00'
const MAR_04_START = '2017-03-04T00:00:00-05:00'
const MAR_12_END = '2017-03-12T23:00:00-05:00'
const APR_17_START = '2017-04-17T00:00:00-05:00'
const APR_17_END = '2017-04-17T23:00:00-05:00'
const APR_19_START = '2017-04-19T00:00:00-05:00'
const APR_19_END = '2017-04-19T23:00:00-05:00'

const fieldsNeeded = 'items(description,id,summary, start, end)'
const singleEventsBool = true
const orderByStart = 'startTime'

var async = require('async')

function cleanUp (req, res) {
  setCalId(req.query.cid,
    function () {
      async.waterfall([
        DELETE_FEB_21,
        MOVE_FEB_20_TO_21,
        DELETE_SPR_BREAK,
        DELETE_APR_19,
        MOVE_APR_17_TO_19
      ], function (err, result) {
        debug(result)
        res.redirect('/end')
      })
    }
  )
}

function setCalId (calId, callback) {
  newCalendarId = calId
  callback()
}

function MOVE_FEB_20_TO_21 (callback) {
  calendarAPI.events.list({
    auth: oauth2Client,
    calendarId: newCalendarId,
    orderBy: orderByStart,
    singleEvents: singleEventsBool,
    timeMax: FEB_20_END,
    timeMin: FEB_20_START,
    fields: fieldsNeeded
  }, function (err, eventList) {
    if (err) {
      debug(err)
      return callback(err)
    } else {
      var items = eventList.items
      // this to fix time zone difference for late night classes
      for (var i = 0, len = items.length; i < len; i++) {
        var startPrefix = '2017-02-21'
        var endPrefix = '2017-02-21'
        if (items[i].start.dateTime.substring(11,13) == '00' || items[i].start.dateTime.substring(11,13) == '01' || items[i].start.dateTime.substring(11,13) == '02') {
          startPrefix = '2017-02-22'
        }
        if (items[i].end.dateTime.substring(11,13) == '00' || items[i].end.dateTime.substring(11,13) == '01' || items[i].end.dateTime.substring(11,13) == '02') {
          endPrefix = '2017-02-22'
        }

        var newStartDateTime = startPrefix + items[i].start.dateTime.substring(10)
        var newEndDateTime = endPrefix + items[i].end.dateTime.substring(10)

        var newDateTime = {
          'end':
            {
              'dateTime': newEndDateTime,
              'timeZone': 'America/New_York'
            },
          'start':
            {
              'dateTime': newStartDateTime,
              'timeZone': 'America/New_York'
            },
          'summary': items[i].summary
        }
        calendarAPI.events.update({
          auth: oauth2Client,
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

function DELETE_FEB_21 (callback) {
  calendarAPI.events.list({
    auth: oauth2Client,
    calendarId: newCalendarId,
    orderBy: orderByStart,
    singleEvents: singleEventsBool,
    timeMax: FEB_21_END,
    timeMin: FEB_21_START,
    fields: fieldsNeeded
  }, function (err, eventList) {
    if (err) {
      debug(err)
      return callback(err)
    } else {
      var items = eventList.items
      for (var i = 0, len = items.length; i < len; i++) {
        calendarAPI.events.delete({
          auth: oauth2Client,
          calendarId: newCalendarId,
          eventId: items[i].id
        }, function (err) {
          if (err) {
            debug('Error deleting ' + err)
            return callback(err)
          }
          return callback(null)
        })
      }
    }
  })
}

function DELETE_SPR_BREAK (callback) {
  calendarAPI.events.list({
    auth: oauth2Client,
    calendarId: newCalendarId,
    orderBy: orderByStart,
    singleEvents: singleEventsBool,
    timeMax: MAR_12_END,
    timeMin: MAR_04_START,
    fields: fieldsNeeded
  }, function (err, eventList) {
    if (err) {
      debug('Error getting spr_break ' + err)
      callback(err)
    } else {
      var items = eventList.items
      for (var i = 0, len = items.length; i < len; i++) {
        calendarAPI.events.delete({
          auth: oauth2Client,
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
  calendarAPI.events.list({
    auth: oauth2Client,
    calendarId: newCalendarId,
    orderBy: orderByStart,
    singleEvents: singleEventsBool,
    timeMax: APR_17_END,
    timeMin: APR_17_START,
    fields: fieldsNeeded
  }, function (err, eventList) {
    if (err) {
      debug(err)
      return callback(err)
    } else {
      var items = eventList.items
      // this to fix time zone difference for late night classes
      for (var i = 0, len = items.length; i < len; i++) {
        var startPrefix = '2017-04-19'
        var endPrefix = '2017-04-19'
        if (items[i].start.dateTime.substring(11,13) == '00' || items[i].start.dateTime.substring(11,13) == '01' || items[i].start.dateTime.substring(11,13) == '02') {
          startPrefix = '2017-04-20'
        }
        if (items[i].end.dateTime.substring(11,13) == '00' || items[i].end.dateTime.substring(11,13) == '01' || items[i].end.dateTime.substring(11,13) == '02') {
          endPrefix = '2017-04-20'
        }

        var newStartDateTime = startPrefix + items[i].start.dateTime.substring(10)
        var newEndDateTime = endPrefix + items[i].end.dateTime.substring(10)

        var newDateTime = {
          'end': {
            'dateTime': newEndDateTime,
            'timeZone': 'America/New_York'
          },
          'start': {
            'dateTime': newStartDateTime,
            'timeZone': 'America/New_York'
          },
          'summary': items[i].summary
        }

        calendarAPI.events.update({
          auth: oauth2Client,
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

function DELETE_APR_19 (callback) {
  calendarAPI.events.list({
    auth: oauth2Client,
    calendarId: newCalendarId,
    orderBy: orderByStart,
    singleEvents: singleEventsBool,
    timeMax: APR_19_END,
    timeMin: APR_19_START,
    fields: fieldsNeeded
  }, function (err, eventList) {
    if (err) {
      debug(err)
      return callback(err)
    } else {
      var items = eventList.items
      for (var i = 0, len = items.length; i < len; i++) {
        calendarAPI.events.delete({
          auth: oauth2Client,
          calendarId: newCalendarId,
          eventId: items[i].id
        }, function (err) {
          if (err) {
            debug('Error deleting ' + err)
            return callback(err)
          } else {
            return callback(null)
          }
        })
      }
    }
  })
}

//date:'2016-02-16T23:00:00-05:00'
// function getDay(dateString, callback)
// {
//   calendar.events.list({
//     auth: oauth2Client,
//     calendarId: newCalendarID,
//     orderBy: 'startTime',
//     singleEvents: true,
//     timeMax: getTimeMax(dateString),
//     timeMin: getTimeMin(dateString),
//     fields: 'items(description,id,summary, start, end)'
//   }, function(err, eventList) {
//     if (err) {
//       debug(err)
//       return callback(err)
//     }
//     return callback(eventList)
//   })
// }
//
// function updateDay(newDateString, callback)
// {
//   calendar.events.update({
//     auth: oauth2Client,
//     calendarId: newCalendarID,
//     eventId: items[i].id,
//     resource: newDateTime
//   }, function(err){
//     if (err) {
//       callback(err)
//     }
//   })
// }

module.exports = {
  cleanUp: cleanUp
}
