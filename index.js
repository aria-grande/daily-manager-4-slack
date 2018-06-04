/* db */
// const pgp = require('pg-promise');
// const cb = pgp(process.env.DATABASE_URL);
// console.log("databse is connected");
/* express */
const express = require('express')
const cron = require('node-cron');
const path = require('path')
const PORT = process.env.PORT || 5000
/* slack */
const { IncomingWebhook, WebClient } = require('@slack/client');
console.log('Getting started with Slack Developer Kit for Node.js');
const timeNotification = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL);

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/register', register)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

function register(req, res) {
  var cronSchedule = '* * * * *';  // todo: change
  var managers = ['aria1', 'aria2', 'aria3']; // todo: change
  var startDate = new Date();

  var sm = StudyManager(startDate, managers);
  var job = cron.schedule(cronSchedule, () => {
    timeNotification.send(`[DAY-${sm.getNthDay()}]
    Today's manager is @${sm.getTodayManager()}.\n
    Tomorrow's manager is @${sm.getTomorrowManager()}`, notiSendCallback);
  });

  console.log(req.body);
  timeNotification.send(`daily manager notification is set!\n${ req }`, notiSendCallback);
  res.send("succeed");
}

function notiSendCallback(err, res) {
  if (err) {
    return console.error(err);
  }
  console.log('Notification sent');
}

var StudyManager = (function(startDate, managers) {
  var startDate = new Date(startDate);
  var endDate = new Date(endDate);

  var cnt = 0;

  function getDiffDays(date1, date2) {
      var timeDiff = Math.abs(date2.getTime() - date1.getTime());
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  function getManagerOfDate(date) {
      var diffDays = getDiffDays(startDate, date);
      // return managers[(diffDays-1) % managers.length];
      return managers[cnt % managers.length];
  }

  return {
      getTodayManager: function() {
        return getManagerOfDate(new Date());
      },
      getTomorrowManager: function() {
          var tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return getManagerOfDate(tomorrow);
      },
      getNthDay: function() {
          cnt += 1;
          console.log(`cnt of StudyManager is ${cnt}`);
          return getDiffDays(startDate, new Date());
      }
  };
});
