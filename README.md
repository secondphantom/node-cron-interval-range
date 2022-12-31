# CronIntervalRange

The cron-interval-range can easily create 'cron' string arrays and schedule tasks that run a specific period of time. Based on the 'node-cron' library.

# Table of Contents
- [CronIntervalRange](#cronintervalrange)
- [Table of Contents](#table-of-contents)
- [Inputs](#inputs)
	- [Interval](#interval)
	- [Options](#options)
- [Usage](#usage)
	- [CreateCronStr](#createcronstr)
	- [CreateSchedule](#createschedule)


# Inputs
## Interval
- Can set either `month` or `day` 
- `"month"`, `"day"` and `"hour, min and sec"` are applied separately
  - If `day` set to 10 and `hour` set to 1, run it repeatedly for an hour every 13 days.
- Total of `"hour, min and sec"` must not exceed 24 hours.
```ts
const interval: {
	month?: number; // 1 to 12
	day?: number; // 1 to 31
	hour?: number; // 0 to Infinity
	min?: number; // 0 to Infinity
	sec?: number; // 0 to Infinity
} = {
	month: 1, 
	day: 2,
}
```
## Options
- Can set either `dayOfMonth` or `dayOfWeek` 
- `"monthOfYear"`, `"dayOfMonth, dayOfWeek"` and `"hour, min and sec"` are applied separately
  - If `dayOfMonth` set to 10 at start and set 31 at end and `hour` set to 2 at start and set to 10 at end. It runs from the 15th to the 31th of the month, and the time runs from 2am to 10am of the day
```ts
const options: {
	start?: { 
		monthOfYear?: number; // 1 to 12
		dayOfMonth?: number; // 1 to 31
		dayOfWeek?: number; // 0 to 7 (0 or 7 are sunday)
		hour?: number; // 0 to 23
		min?: number; // 0 to 59
		sec?: number; // 0 to 59
	} as StartEndInput
	end?: StartEndInput;
} = {}
```
# Usage
## CreateCronStr
```ts
/*
CronIntervalRange.createCronStr: (
	interval: IntervalInput, 
	options?: {
		start?: StartEndInput | undefined;
		end?: StartEndInput | undefined;
	} | undefined) => string[];
*/
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
```
## CreateSchedule
```ts
/*
CronIntervalRange.createSchedule: (
	interval: IntervalInput, 
	func: (...args: any[]) => any,
	options?: {
		start?: StartEndInput | undefined;
		end?: StartEndInput | undefined;
		scheduleOptions?: cron.ScheduleOptions | undefined;
	} | undefined
) => Array<cron.ScheduledTask>;
*/
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
```
