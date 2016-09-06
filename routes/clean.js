//Authentication
var authenticate = require('./authenticate.js');
var oauth2Client = authenticate.client;
var calendarAPI = authenticate.api.calendar('v3');
var newCalendarId;

//API globals
var octTenStart = '2016-10-10T00:00:00-05:00';
var octTenEnd = '2016-10-10T23:00:00-05:00';
var octElevenStart = '2016-10-11T00:00:00-05:00';
var octElevenEnd = '2016-10-11T23:00:00-05:00';
var novTwentyThirdStart = '2016-11-23T00:00:00-05:00';
var novTwentyFifthEnd = '2016-11-25T23:00:00-05:00';

var fieldsNeeded = 'items(description,id,summary, start, end)';
var singleEventsBool = true;
var orderByStart = 'startTime';

//async
var async = require('async');

function cleanUp(req, res)
{
  setCalId(req.query.cid,
    function(){
        async.waterfall([
          deleteOctEleven,
          moveOctTenToEleven,
          deleteThanksgiving
      ], function (err, result) {
          console.log(result);
          res.redirect('/end');
      })
    }
  );

}

function setCalId(calId, callback)
{
  newCalendarId = calId;
  callback();
}

function moveOctTenToEleven(callback)
{
  calendarAPI.events.list({
    auth: oauth2Client,
    calendarId: newCalendarId,
    orderBy: orderByStart,
    singleEvents: singleEventsBool,
    timeMax: octTenEnd,
    timeMin: octTenStart,
    fields: fieldsNeeded
  }, function(err, eventList){
    if (err) {
      console.log('Error getting 10/10 ' + err);
      callback(err);
    }
    else{
        var items = eventList.items;
        // console.log(eventList.items);
        //this to fix time zone difference for late night classes
        for(var i = 0, len = items.length; i < len; i++ ){

          var startPrefix = '2016-10-11';
          var endPrefix = '2016-10-11';
          if(items[i].start.dateTime.substring(11,13) == '00' || items[i].start.dateTime.substring(11,13) == '01' || items[i].start.dateTime.substring(11,13) == '02'){
            startPrefix ='2016-10-12';
          }
          if(items[i].end.dateTime.substring(11,13) == '00' || items[i].end.dateTime.substring(11,13) == '01' || items[i].end.dateTime.substring(11,13) == '02'){
            endPrefix ='2016-10-12';
          }

          var newStartDateTime = startPrefix + items[i].start.dateTime.substring(10);
          var newEndDateTime = endPrefix + items[i].end.dateTime.substring(10);

          var newDateTime = {
            "end":
              {
                "dateTime": newEndDateTime,
                "timeZone": 'America/New_York'
              },
            "start":
              {
                "dateTime": newStartDateTime,
                "timeZone": 'America/New_York'
              },
              "summary": items[i].summary
          }
          calendarAPI.events.update({
            auth: oauth2Client,
            calendarId: newCalendarId,
            eventId: items[i].id,
            resource: newDateTime
          }, function(err){
            if (err) {
              console.log('Error updating 10/10->10/11 ' + err);
              callback(err);
            }
        });
      }
      callback(null);
    }
  });
}

function deleteOctEleven(callback)
{
  calendarAPI.events.list({
    auth: oauth2Client,
    calendarId: newCalendarId,
    orderBy: orderByStart,
    singleEvents: singleEventsBool,
    timeMax: octElevenEnd,
    timeMin: octElevenStart,
    fields: fieldsNeeded
  }, function(err, eventList){
    if (err) {
      console.log('Error getting 10/11 ' + err);
      callback(err);
    }
    else {
        var items = eventList.items;
        for(var i = 0, len = items.length; i < len; i++ ){
          calendarAPI.events.delete({
            auth: oauth2Client,
            calendarId: newCalendarId,
            eventId: items[i].id
          }, function(err){
            if (err) {
              console.log('Error deleting 10/11 ' + err);
              callback(err);
            }
            else {
              callback(null);
            }
        });
      }
    }
  });
}

//11/23-27
function deleteThanksgiving(callback)
{
  calendarAPI.events.list({
    auth: oauth2Client,
    calendarId: newCalendarId,
    orderBy: orderByStart,
    singleEvents: singleEventsBool,
    timeMax: novTwentyFifthEnd,
    timeMin: novTwentyThirdStart,
    fields: fieldsNeeded
  }, function(err, eventList){
    if (err) {
      console.log('Error getting thanksgiving ' + err);
      callback(err);
    }
    else {
        var items = eventList.items;
        for(var i = 0, len = items.length; i < len; i++ ){
          calendarAPI.events.delete({
            auth: oauth2Client,
            calendarId: newCalendarId,
            eventId: items[i].id
          }, function(err){
            if (err) {
              console.log('Error deleting thanksgiving ' + err);
              callback(err);
            }
            else {
              callback(null, 'done deleting');
            }
        });
      }
    }
  });
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
//       console.log(err);
//       return callback(err);
//     }
//     return callback(eventList);
//   });
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
//       callback(err);
//     }
//   });
// }

module.exports = {
  cleanUp: cleanUp
}
