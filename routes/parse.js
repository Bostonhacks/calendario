const MON_START = '20170123';
const TUE_START = '20170124';
const WED_START = '20170125';
const THU_START = '20170119';
const FRI_START = '20170120';
const TIMEZONE = '-05:00';

// Returns parsed array
// @jknollmeyer
function createClassArray(req)
{
  var classArray = [];
  //Iterate through every property in the query
  for(var property in req.query){
    //Once we reach the "e" property, there are no more class properties
    if(property == "e")
      break;
    else {
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

  return classArray;
}

//Change datetime format from 20150902 to "2015-09-03T10:00:00.000-07:00"
function setDateTimeFormat(time, date) {
  if(!time || !date){
    console.log("Error formatting datetime - no time or date");
    return;
  }

  date = date.substring(0,4) + "-" + date.substring(4,6) + "-" + date.substring(6);
  time = time.substring(0,2) + ":" + time.substring(2);
  time = time + ":00.000" + TIMEZONE;

  var dateTime = date + 'T' + time;

  console.log(dateTime);
  return dateTime;
}

function getWeekDay(string){
    switch(string) {
      case 'Mon':
          return MON_START;
      case 'Tue':
          return TUE_START;
      case 'Wed':
          return WED_START;
      case 'Thu':
          return THU_START;
      case 'Fri':
          return FRI_START;
      default:
          console.log('weekday recognition error');
          return null;
      }
}

module.exports = {
  createClassArray: createClassArray,
  setDateTimeFormat: setDateTimeFormat,
  getWeekDay: getWeekDay
}
