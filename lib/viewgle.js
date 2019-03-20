const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const moment = require("moment");

const Analytics = require("./analytics");

var state = {
  data: "",
  mongoConnection: "",
  opts: ""
};

define = opts => {
  // set the database connection to the state
  state.mongoConnection = opts.dbConnect;

  // set up opts
  state.opts = opts;

  // set up defaults for asset skipping
  if (typeof opts.skipAssets == "undefined") {
    state.opts.skipAssets = true;
  } else {
    state.opts.skipAssets = opts.skipAssets;
  }

  // set up defaults for localhost skipping
  if (typeof opts.skipLocalhost == "undefined") {
    state.opts.skipLocalhost = true;
  } else {
    state.opts.skipLocalhost = opts.skipLocalhost;
  }

  buildDataForChart = resp => {
    let data = getData(resp);
    let dates = getDates(resp);

    let result = [];
    data.forEach((item, i) => {
      result.push({
        date: dates[i],
        hit: item
      });
    });

    return result;
  };

  getData = items => {
    let counter = {};
    items.forEach(item => {
      item.date = moment(item.date).format("MM-DD-YYYY");
    });

    items.forEach(obj => {
      let key = JSON.stringify(obj.date);
      counter[key] = (counter[key] || 0) + 1;
    });

    return Object.values(counter);
  };

  getDates = items => {
    let dates = [];
    items.forEach(item => {
      dates.push(moment(item.date).format("MM-DD-YYYY"));
    });

    o = {};
    dates.forEach(e => {
      o[e] = true;
    });

    return Object.keys(o);
  };

  setDatabase = connectionString => {
    state.mongoConnection = connectionString;
  };

  connectLogAndExit = () => {
    mongoose.connect(state.mongoConnection, { useNewUrlParser: true });
    let saveData = new Analytics(state.data);
    saveData.save((err, resp) => {
      if (err)
        console.log(
          "There was an error saving the new data to the database:",
          err
        );
      mongoose.connection.close();
    });
  };

  collectData = req => {
    var ip;

    if (
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress == "::1" ||
      req.connection.remoteAddress == "::ffff:127.0.0.1"
    ) {
      ip = "localhost";
    } else {
      ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    }

    state.data = {
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: req.body,
      method: req.method,
      ip: ip,
      date: moment()
    };
  };

  collectAndStoreData = (req, next) => {
    let url = req.url.split(".");
    let asset = url[url.length - 1];

    if (
      (req.headers["x-forwarded-for"] || req.connection.remoteAddress) ==
        "::1" ||
      (req.headers["x-forwarded-for"] || req.connection.remoteAddress) ==
        "::ffff:127.0.0.1"
    ) {
      if (state.opts.skipLocalhost) {
        return next();
      }
    }

    if (
      asset == "css" ||
      asset == "js" ||
      asset == "png" ||
      asset == "jpeg" ||
      asset == "jpg" ||
      asset == "ico" ||
      asset == "gif"
    ) {
      if (state.opts.skipAssets) {
        return next();
      }
    }

    collectData(req);
    connectLogAndExit();
    next();
  };

  return (define = (req, res, next) => next());
};

router.get("/viewgle", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

router.get("/viewgle/getAllEntries", (req, res) => {
  mongoose.connect(state.mongoConnection, { useNewUrlParser: true });
  Analytics.find({}, (err, resp) => {
    if (err)
      console.log(
        `There was an error getting all the entries in the database: ${err}`
      );
    let allEntries = resp;
    let month = {};
    let week = {};
    let monthStart = moment().subtract(1, "month");
    let weekStart = moment().subtract(1, "week");
    let today = moment();

    Analytics.find({ date: { $gte: monthStart, $lt: today } })
      .sort({ date: "asc" })
      .exec((err, resp) => {
        if (err)
          console.log(
            "There was an error getting entries between:" +
              monthStart +
              " and " +
              today +
              " in the database:",
            err
          );
        month = buildDataForChart(resp);
        Analytics.find({ date: { $gte: weekStart, $lt: today } })
          .sort({ date: "asc" })
          .exec((err, resp) => {
            if (err)
              console.log(
                "There was an error getting entries between:" +
                  weekStart +
                  " and " +
                  today +
                  " in the database:",
                err
              );
            week = buildDataForChart(resp);
            res.send({ allEntries: allEntries, month: month, week: week });
          });
      });
  });
});

router.get("*", (req, res, next) => collectAndStoreData(req, next));

router.get("/viewgle/logRoute/:route", (req, res, next) => {
  res.status(200);
});

module.exports = {
  define: define,
  router: router
};
