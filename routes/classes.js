var express = require('express');
var router = express.Router();
//endpoint for getting objects from parameters
router.get('/',function(req, res, next){
  classArray = [];
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
  console.log(classArray);
  //Use our class array to create actual events
  for(var index in classArray){
    console.log(classArray[index]);
    var calendarEvent = {
      'summary' : classArray[index].c,
    };
  }

});
module.exports = router;
