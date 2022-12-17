import cronIntervalRange from "..";

cronIntervalRange.createSchedule(
  { hour: 0, min: 0, sec: 1 },
  () => console.log(new Date().toLocaleTimeString()),
  {
    start: { hour: 0, dayOfMonth: 1 },
    end: { hour: 24, dayOfMonth: 31 },
  }
);

const cronStrAry = cronIntervalRange.createCronStr(
  { hour: 1, min: 30, sec: 0 },
  {
    start: { hour: 0, dayOfMonth: 1 },
    end: { hour: 24, dayOfMonth: 31 },
  }
);
console.log(cronStrAry);
/* 
[ '0 0 0,3,6,9,12,15,18,21 * * *', '0 30 1,4,7,10,13,16,19,22 * * *' ]
*/
