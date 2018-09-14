const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const moment = require('moment')

const Analytics = require('./analytics')

let state = {
  data: '',
  mongoConnection: ''
}

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

router.get('/getAllEntries', (req, res) => {
  mongoose.connect(state.mongoConnection, { useNewUrlParser: true })
  Analytics.find({}, (err, resp) => {
    if(err) console.log('There was an error getting all the entries in the database:', err)
    var allEntries = resp
    var byWeek = {}
    var byMonth = {}
    var month = {}
    var week = {}
    var monthStart = moment().subtract(1, 'month')
    var weekStart = moment().subtract(1, 'week')
    var today = moment()

    Analytics.find({'date': {'$gte': monthStart, '$lt': today}}, (err, resp) => {
      if(err) console.log('There was an error getting entries between:' + monthStart+' and ' + today + ' in the database:', err)
      month = buildDataForChart(resp)
      Analytics.find({'date': {'$gte': weekStart, '$lt': today}}, (err, resp) => {
        if(err) console.log('There was an error getting entries between:' + weekStart+' and ' + today + ' in the database:', err)
        week = buildDataForChart(resp)
        res.send({allEntries: allEntries, month: month, week: week})
      })
    })
  })
})

buildDataForChart = (resp) => {
  var data = getData(resp)
  var dates = getDates(resp)

  var result = [];
  data.forEach((item, i) => {
    result.push({
      date: dates[i],
      hit: item
    })
  })

  return result;
}

getData = (items) => {
  var counter = {}
  items.forEach((item) => {
    item.date = moment(item.date).format('MM-DD-YYYY')
  })

  items.forEach((obj) => {
    var key = JSON.stringify(obj.date)
    counter[key] = (counter[key] || 0) + 1
  })

  return Object.values(counter)
}

getDates = (items) => {
  var dates = []
  items.forEach((item) => {
    dates.push(moment(item.date).format('MM-DD-YYYY'))
  })

  o={}
  dates.forEach((e) => {
      o[e]=true
  })

  var dates = Object.keys(o)

  return dates
}

setDatabase = (connectionString) => {
  state.mongoConnection = connectionString
}

connectLogAndExit = () => {
  mongoose.connect(state.mongoConnection, { useNewUrlParser: true })
  var saveData = new Analytics(state.data)
  saveData.save((err, resp) => {
    if(err) console.log('There was an error saving the new data to the database:', err)
    mongoose.connection.close()
  })
}

collectData = (req) => {
  state.data = {
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.body,
    method: req.method,
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    date: moment()
  }
}

collectAndStoreData = (req, next) => {
  collectData(req)
  connectLogAndExit()
  next()
}

module.exports = {
  router: router,
  setDatabase: setDatabase,
  collectData: collectData,
  collectAndStoreData: collectAndStoreData
}