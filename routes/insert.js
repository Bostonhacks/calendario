//async
var async = require('async');

//Authentication
var authenticate = require('./authenticate.js');
var oauth2Client = authenticate.client;
var calendarAPI = authenticate.api.calendar('v3');

//Parser
var parser = require('./parse.js');

function insertCalendar(req, res)
{
  calendarAPI.calendars.insert({
    auth: oauth2Client,
    'resource' : {
      'summary' : req.query.name
    }
  }, function(err, calendarCreated) {
      if (err) {
        console.log('CREATE CALENDAR ERROR ' + err);
        res.redirect('/error');
      }
      console.log('New calendar created - ' );
      console.log('calendarId:' + calendarCreated.id);
      insertClasses(req, res, calendarCreated);
  });
}

function insertClasses(req, res, calendarCreated)
{
  var classArray = parser.createClassArray(req);
  async.forEach(classArray, insertClass.bind(insertClass, calendarCreated),
    function(err){
      if(err) {
        console.log('Error on class insertion ' + err);
        res.redirect('/error');
      }
      else {
        console.log('Completed class insertion!');
        res.redirect('/clean');
      }
    });
}

var insertClass = function (calendarCreated, arrayIndex, callback)
{
  var startDate = parser.getWeekDay(arrayIndex.d);
  var startDateTime = parser.setDateTimeFormat(arrayIndex.tb, startDate);
  var endDateTime = parser.setDateTimeFormat(arrayIndex.te, startDate);

  var event = {
    "summary": arrayIndex.c,
    "start": {
      "dateTime": startDateTime,
      "timeZone": "America/New_York"
    },
    "end": {
      "dateTime": endDateTime,
      "timeZone": "America/New_York"
    },
    "recurrence": [
      "RRULE:FREQ=WEEKLY;UNTIL=20161212T120000Z",//BU-SPECIFIC
    ]
  };

  calendarAPI.events.insert({
      auth: oauth2Client,
      calendarId: calendarCreated.id,
      resource: event,
    }, function(err, event)
      {
        if(err)
        {
          console.log("Error on insert");
          return callback(err);
        }
        else {
          return callback();
        }
      }
  );
}

function insertEventErrorHandler(err, event, retryCount, callback)
{
  if(err) {
    if(err.code == 403)
    {
      if(retryCount < 4)
      {
        console.log('Ratelimited, retrying...');
        setTimeout(insertClass)
      }
      else
      {
        console.log('Too many ratelimit errors, exiting');
        res.redirect('/error');
      }
    }
    else
    {
      console.log('Unknown error on event insertion');
      res.redirect('/error');
    }
  }
  else {
    callback();
  }
}

module.exports = {
  insertCalendar: insertCalendar,
  insertClasses: insertClasses
}
