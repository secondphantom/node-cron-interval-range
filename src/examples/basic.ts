import cronIntervalRange from "..";

cronIntervalRange.createSchedule(
  {
    hour: 0,
    min: 0,
    sec: 1,
    day: 1, // either one
    // month:1 // either one
  },
  () => console.log(new Date().toLocaleTimeString()),
  {
    start: {
      hour: 0,
      min: 0,
      sec: 0,
      dayOfMonth: 1, // either one
      // dayOfWeek: 1 // either one
      monthOfYear: 7,
    },
    end: {
      hour: 23,
      min: 30,
      sec: 0,
      dayOfMonth: 31,
      // dayOfWeek: 7
      monthOfYear: 12,
    },
    scheduleOptions: {
      scheduled: true,
    },
  }
);

const cronStrAry = cronIntervalRange.createCronStr(
  { hour: 1, min: 30, sec: 0, month: 1 },
  {
    start: {
      hour: 0,
      min: 0,
      sec: 0,
      // dayOfMonth: 1,
      // dayOfWeek: 1
      monthOfYear: 7,
    },
    end: {
      hour: 23,
      min: 30,
      sec: 0,
      // dayOfMonth: 31,
      // dayOfWeek: 7
      monthOfYear: 12,
    },
  }
);
console.log(cronStrAry);
/* 
[
  '0 0 0,3,6,9,12,15,18,21 * 7,8,9,10,11,12 *',
  '0 30 1,4,7,10,13,16,19,22 * 7,8,9,10,11,12 *'
]
*/
