var express = require('express');
var router = express.Router();
var async = require('async');

//Authentication
var authenticate = require('./authenticate.js');
var oauth2Client = authenticate.client;

//Parse user string input
var parse = require('./parse.js');

//Change datetime format from 20150902 to "2015-09-03T10:00:00.000-07:00"
function setDateTimeFormat(time, date) {
  if(!time || !date){
    console.log("Error formatting datetime");
    return;
  }

  date = date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6);
  time = time.substring(0,2) + ":"+time.substring(2);
  time = time + ":00.000-05:00";

  var dateTime = date + 'T' + time;

  // console.log(dateTime);
  return dateTime;
}

//Get weekday for start of classes
//Updated for spring
function getWeekDay(string){
    switch(string) {
      case 'Mon':
          //return '20150914';
          return '20160125';
      case 'Tue':
          //return '20150908';
          return '20160119';
      case 'Wed':
          //return '20150902';
          return '20160120';
      case 'Thu':
          //return '20150903';
          return '20160121';
      case 'Fri':
          //return '20150904';
          return '20160122';
      default:
          console.log('weekday recognition error');
          return null;
      }
}

function createClass()
{
  var startDate = getWeekDay(index.d);
  var startDateTime = setDateTimeFormat(index.tb, startDate);
  var endDateTime = setDateTimeFormat(index.te, startDate);

  var event = {
    "summary": index.c,
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
}

// function insertClass(auth, calendarId, class)
// {
//
// }
//
// function insertClassResHandler(err, class)
// {
//
// }

function insertEvents(req, calendar, newCalendarID, callback){
    classArray  = [];
    //Iterate through every property in the query
    for(var property in req.query){
      //Once we reach the "e" property, there are no more class properties
      if(property == "e")
        break;
      else{
        //replacing the letters will tell us which class this is
        index = property.replace(/[a-z]/g,'');
        //replacing the numbers will give us the property type
        type = property.replace(/[0-9]/g,'');
        if(!classArray[index])
          classArray[index] = {};
        //Set the properties of our class array from the query's data
        classArray[index][type] = req.query[property];
      }
    }

    classArray.splice(0,1);

    var insertSingle = function(index, key, doneCallback){
      var startDate = getWeekDay(index.d);
      var startDateTime = setDateTimeFormat(index.tb, startDate);
      var endDateTime = setDateTimeFormat(index.te, startDate);

      var event = {
        "summary": index.c,
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

      calendar.events.insert({
        auth: oauth2Client,
        calendarId: newCalendarID,
        resource: event,
      }, function(err, event) {
        if (err) {
          console.log('EVENT CREATION ERROR ' + err);
          return;
        }
        else{
          console.log(event.summary + ' created ');
          return doneCallback(null);
        }
      });
    }

    //Use our class array to create actual events
    async.forEachOf(classArray, insertSingle, function (err) {
      //console.log("Finished inserting events!");
      // so we're now done! get the events we need to delete/modify
      // delete Feb 16th
      calendar.events.list({
        auth: oauth2Client,
        calendarId: newCalendarID,
        orderBy: 'startTime',
        singleEvents: true,
        timeMax: '2016-02-16T23:00:00-05:00',
        timeMin: '2016-02-16T00:00:00-05:00',
        fields: 'items(description,id,summary)'
      }, function(err, eventList){
        if (err) {
          console.log('EVENTLIST ERROR ' + err);
          return;
        }
        else{
            var items = eventList.items;
            for(var i = 0, len = items.length; i < len; i++ ){
              calendar.events.delete({
                auth: oauth2Client,
                calendarId: newCalendarID,
                eventId: items[i].id
              }, function(err){
                if (err) {
                  console.log('EVENT DELETE ERROR ' + err);
                  return;
                }
            });
          }
        }
      });

      //Move 02/15 to 02/16 (Monday schedule)
      calendar.events.list({
        auth: oauth2Client,
        calendarId: newCalendarID,
        orderBy: 'startTime',
        singleEvents: true,
        timeMax: '2016-02-15T23:00:00-05:00',
        timeMin: '2016-02-15T00:00:00-05:00',
        fields: 'items(description,id,summary, start, end)'
      }, function(err, eventList){
        if (err) {
          console.log('EVENT DELETE ERROR #2' + err);
          return;
        }
        else{
            var items = eventList.items;
            // console.log(items);
            //this to fix time zone difference for late night classes
            for(var i = 0, len = items.length; i < len; i++ ){
              var startPrefix = '2016-02-16';
              var endPrefix = '2016-02-16';
              console.log(items[i].start.dateTime.substring(11,13));
              if(items[i].start.dateTime.substring(11,13) == '00' || items[i].start.dateTime.substring(11,13) == '01' || items[i].start.dateTime.substring(11,13) == '02'){
                startPrefix ='2016-02-17';
              }
              if(items[i].end.dateTime.substring(11,13) == '00' || items[i].end.dateTime.substring(11,13) == '01' || items[i].end.dateTime.substring(11,13) == '02'){
                endPrefix ='2016-02-17';
              }

              var newStartDateTime = startPrefix + items[i].start.dateTime.substring(10);
              var newEndDateTime = endPrefix + items[i].end.dateTime.substring(10);
              console.log(newEndDateTime);
              console.log(newStartDateTime);
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
              calendar.events.update({
                auth: oauth2Client,
                calendarId: newCalendarID,
                eventId: items[i].id,
                resource: newDateTime
              }, function(err){
                if (err) {
                  console.log('EVENT UPDATE ERROR ' + err);
                  return;
                }
            });
          }
        }
      });

      //Delete 03/5 - 03/13 (spring break)
      calendar.events.list({
        auth: oauth2Client,
        calendarId: newCalendarID,
        orderBy: 'startTime',
        singleEvents: true,
        timeMax: '2016-03-13T23:00:00-05:00',
        timeMin: '2016-03-05T00:00:00-05:00',
        fields: 'items(description,id,summary)'
      }, function(err, eventList){
        if (err) {
          console.log('EVENT DELETE ERROR #3' + err);
          return;
        }
        else{
            var items = eventList.items;
            for(var i = 0, len = items.length; i < len; i++ ){
              calendar.events.delete({
                auth: oauth2Client,
                calendarId: newCalendarID,
                eventId: items[i].id
              }, function(err){
                if (err) {
                  console.log('EVENT DELETE ERROR #4' + err);
                  return;
                }
            });
          }
        }
      });

      // delete 04/20
        calendar.events.list({
          auth: oauth2Client,
          calendarId: newCalendarID,
          orderBy: 'startTime',
          singleEvents: true,
          timeMax: '2016-04-20T23:00:00-05:00',
          timeMin: '2016-04-20T00:00:00-05:00',
          fields: 'items(description,id,summary)'
        }, function(err, eventList){
          if (err) {
            console.log('EVENTLIST ERROR ' + err);
            return;
          }
          else{
              var items = eventList.items;
              for(var i = 0, len = items.length; i < len; i++ ){
                calendar.events.delete({
                  auth: oauth2Client,
                  calendarId: newCalendarID,
                  eventId: items[i].id
                }, function(err){
                  if (err) {
                    console.log('EVENT DELETE ERROR ' + err);
                    return;
                  }
              });
            }
          }
        });

        //Move 04/18 to 04/20 (Monday schedule)
        calendar.events.list({
          auth: oauth2Client,
          calendarId: newCalendarID,
          orderBy: 'startTime',
          singleEvents: true,
          timeMax: '2016-04-18T23:00:00-05:00',
          timeMin: '2016-04-18T00:00:00-05:00',
          fields: 'items(description,id,summary, start, end)'
        }, function(err, eventList){
          if (err) {
            console.log('EVENT DELETE ERROR #2' + err);
            return;
          }
          else{
              var items = eventList.items;
              // console.log(items);
              //this to fix time zone difference for late night classes
              for(var i = 0, len = items.length; i < len; i++ ){
                var startPrefix = '2016-04-20';
                var endPrefix = '2016-04-20';
                console.log(items[i].start.dateTime.substring(11,13));
                if(items[i].start.dateTime.substring(11,13) == '00' || items[i].start.dateTime.substring(11,13) == '01' || items[i].start.dateTime.substring(11,13) == '02'){
                  startPrefix ='2016-04-21';
                }
                if(items[i].end.dateTime.substring(11,13) == '00' || items[i].end.dateTime.substring(11,13) == '01' || items[i].end.dateTime.substring(11,13) == '02'){
                  endPrefix ='2016-04-21';
                }

                var newStartDateTime = startPrefix + items[i].start.dateTime.substring(10);
                var newEndDateTime = endPrefix + items[i].end.dateTime.substring(10);
                console.log(newEndDateTime);
                console.log(newStartDateTime);
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
                calendar.events.update({
                  auth: oauth2Client,
                  calendarId: newCalendarID,
                  eventId: items[i].id,
                  resource: newDateTime
                }, function(err){
                  if (err) {
                    console.log('EVENT UPDATE ERROR ' + err);
                    return;
                  }
              });
            }
          }
        });

    });
    callback();
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BU Schedule to Google Calendar Import', subtitle: 'Use this tool to create a google calendar from your BU class schedule.' });
});

router.get('/new_bu_calendar/', function(req, res, next) {
  res.render('new_bu_calendar', {
    title: 'Enter schedule URL below',
    instruction:'Go to the StudentLink and click Current Schedule. Sign in. RIGHT CLICK ON THE GRAPH and select "Copy Image URL". Paste Below.',
    name:'Enter the name of your calendar here: '
  });
});

// Create calendar
router.get('/classes/',function(req, res, next){
    if(!oauth2Client){
      res.redirect('/');
    }
    else{
      var calendar = google.calendar('v3');
      var newCalendarID;
      var name = req.query.name;
      calendar.calendars.insert({
        auth: oauth2Client,
        "resource" :{
          'summary': name
        }
      }, function(err, cal) {
          if (err) {
            console.log('CREATE CALENDAR ERROR ' + err);
            return;
          }
          console.log('New calendar created - ' );
          console.log('calendarId:' + cal.id);
          // console.log(newCalendarID);
          insertEvents(req, calendar, cal.id, function(){
            console.log('Events inserted');
            res.redirect('/end');
          });
      });
    }
});

router.get('/end', function(req, res, next){
  res.render('end');
});

router.get('/google/auth/', function(req, res){
  authenticate.getAccessToken(res);
});

router.get('/google/authcomplete/', function(req, res){
  authenticate.setToken(req.query.code, res);
});

router.get('/instructions',function(req, res){
  res.render('instructions');
});

module.exports = router;
