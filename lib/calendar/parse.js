const debug = require('debug')('lib:calendar:parse')

const moment = require('moment')

const MON_START_ISO = moment(process.env.MON_START, 'YYYY-MM-DD').toISOString(true)
const TUE_START_ISO = moment(process.env.MON_START, 'YYYY-MM-DD').toISOString(true)
const WED_START_ISO = moment(process.env.MON_START, 'YYYY-MM-DD').toISOString(true)
const THU_START_ISO = moment(process.env.MON_START, 'YYYY-MM-DD').toISOString(true)
const FRI_START_ISO = moment(process.env.MON_START, 'YYYY-MM-DD').toISOString(true)

// Returns parsed array of classes and times
// @jknollmeyer
function createClassArray (query) {
  debug(query)
  return new Promise((resolve, reject) => {
    let classArray = []
    let i = 1

    // Remove unneeded inputs
    delete query['e']
    delete query['height']
    delete query['width']
    delete query['LastActivityTime']

    // query is a hash with a bunch of things parsed like this
    // c1=CAS+MA193+A1&d1=Tue&tb1=1230&te1=1345&db1=20180118&de1=20180501& (in hash form)

    while (query['c' + i]) {
      let name = query['c' + i]
      let weekday = query['d' + i]
      let startTime = query['tb' + i]
      let endTime = query['te' + i]
      let startDate = query['db' + i]
      let endDate = query['de' + i]

      delete query['c' + i]
      delete query['d' + i]
      delete query['tb' + i]
      delete query['te' + i]
      delete query['db' + i]
      delete query['de' + i]

      classArray.push({
        name,
        weekday,
        startTime,
        endTime,
        startDate,
        endDate
      })

      i++
    }

    debug(classArray)
    query['classes'] = classArray
    resolve(query)
  })
}

// Change datetime format from 20150902 to '2015-09-03T10:00:00.000-07:00'
// TODO assert date, time exist + length is correct
function getDateTime (date, time) {
  let hour = Number(time.substr(0, 2))
  let minute = Number(time.substr(2))

  let dt = moment(date, 'YYYY-MM-DD').add(hour, 'hours').add(minute, 'minutes').toISOString(true)
  debug(dt)
  return dt
}

function getWeekDay (day) {
  switch (day) {
    case 'Mon':
      return MON_START_ISO
    case 'Tue':
      return TUE_START_ISO
    case 'Wed':
      return WED_START_ISO
    case 'Thu':
      return THU_START_ISO
    case 'Fri':
      return FRI_START_ISO
    default:
      throw new Error('weekday recognition error: ' + day)
  }
}

module.exports = { createClassArray, getDateTime, getWeekDay }
