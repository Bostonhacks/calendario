//Returns parsed array
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

  //Debug
  //console.log(classArray);
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
          return '20160912';
      case 'Tue':
          return '20160906';
      case 'Wed':
          return '20160907';
      case 'Thu':
          return '20160908';
      case 'Fri':
          return '20160909';
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
