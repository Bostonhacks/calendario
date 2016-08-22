var express = require('express');
var router = express.Router();

//Authentication
var authenticate = require('./authenticate.js');
//Parse user string input
var insert = require('./insert.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'BU Schedule to Google Calendar Import', subtitle: 'Use this tool to create a google calendar from your BU class schedule.' });
});

//New calendar info
router.get('/new_bu_calendar/', function(req, res, next) {
  res.render('new_bu_calendar', {
    title: 'Enter schedule URL below',
    instruction:'Go to the StudentLink and click Current Schedule. Sign in. RIGHT CLICK ON THE GRAPH and select "Copy Image URL". Paste Below.',
    name:'Enter the name of your calendar here: '
  });
});

// Entry point into creating calendar
router.get('/classes/',function(req, res, next){
  var result = insert.insertCalendar(req, res);
});

//Entry point into clean up days
router.get('/clean', function(req, res, next){
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

router.get('/end', function(req, res, next){
  res.render('end');
});

module.exports = router;
