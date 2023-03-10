"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const isSetEqual = (set1, set2) => {
    if (set1.size !== set2.size)
        return false;
    let iter = set1.size <= set2.size ? set1 : set2;
    let compare = set1.size <= set2.size ? set2 : set1;
    let isEqual = true;
    for (const each of iter) {
        if (!compare.has(each)) {
            isEqual = false;
            break;
        }
    }
    return isEqual;
};
class CronIntervalRange {
    constructor() {
        this.intervalRange = {
            month: [1, 12],
            day: [1, 31],
            hour: [0, Infinity],
            min: [0, Infinity],
            sec: [0, Infinity],
        };
        this.startEndRange = {
            monthOfYear: [1, 12],
            dayOfWeek: [1, 7],
            dayOfMonth: [1, 31],
            hour: [0, 24],
            min: [0, 59],
            sec: [0, 59],
        };
        this.validValue = (range, key, value) => {
            if (value < range[0] || value > range[1])
                throw new Error(`'${key}' value is '${range[0]} <= value <= ${range[1]}'`);
            return value;
        };
        this.validateBothStartEndInput = (start, end) => {
            // either one
            if ((start.dayOfMonth !== undefined && start.dayOfWeek !== undefined) ||
                (end.dayOfMonth !== undefined && end.dayOfWeek !== undefined) ||
                (start.dayOfWeek !== undefined && end.dayOfWeek === undefined) ||
                (end.dayOfWeek !== undefined && start.dayOfWeek === undefined)) {
                throw new Error("Start End Input either 'dayOfMonth' or 'dayOfWeek'\n");
            }
            const newStart = this.validateStartEndInput(true, start);
            const newEnd = this.validateStartEndInput(false, end);
            // end is after start
            for (const key in newStart) {
                if (!["dayOfWeek", "dayOfMonth", "monthOfYear"].includes(key))
                    continue;
                const validStart = newStart[key];
                const validEnd = newEnd[key];
                if (validStart > validEnd)
                    throw new Error(`The '${key}' 'end' time must be after 'start' time`);
            }
            const baseTime = {
                hour: 24,
                min: 60,
                sec: 60,
            };
            const limitSec = (newEnd.hour - newStart.hour) * baseTime.min * baseTime.sec +
                (newEnd.min - newStart.min) * baseTime.sec +
                (newEnd.sec - newStart.sec);
            if (limitSec <= 0) {
                throw new Error("The 'end' HMS time must be after 'start' HMS time");
            }
            return { newStart, newEnd };
        };
        this.validateStartEndInput = (isStart, input) => {
            const defaultInput = {
                monthOfYear: isStart ? 1 : 12,
                ...((input === null || input === void 0 ? void 0 : input.dayOfMonth) === undefined && (input === null || input === void 0 ? void 0 : input.dayOfWeek) === undefined
                    ? { dayOfMonth: isStart ? 1 : 31 }
                    : {}),
                hour: isStart ? 0 : 24,
                min: isStart ? 0 : 0,
                sec: isStart ? 0 : 0,
                ...((input === null || input === void 0 ? void 0 : input.dayOfWeek) ? { dayOfWeek: isStart ? 1 : 7 } : {}),
                ...((input === null || input === void 0 ? void 0 : input.dayOfMonth) ? { dayOfMonth: isStart ? 1 : 31 } : {}),
            };
            const newInput = {
                ...defaultInput,
                ...input,
            };
            for (const key in newInput) {
                newInput[key] = this.validValue(this.startEndRange[key], key, newInput[key]);
            }
            return newInput;
        };
        this.validateIntervalInput = (input) => {
            const newInput = {
                month: 1,
                day: 1,
                hour: 0,
                min: 0,
                sec: 0,
                ...input,
            };
            for (const key in newInput) {
                newInput[key] = this.validValue(this.intervalRange[key], key, newInput[key]);
            }
            return newInput;
        };
        this.getHmsCron = (interval, start, end) => {
            const baseTime = {
                hour: 24,
                min: 60,
                sec: 60,
            };
            let intervalSec = interval.hour * baseTime.min * baseTime.sec +
                interval.min * baseTime.sec +
                interval.sec;
            if (intervalSec <= 0) {
                throw new Error("'interval' must be at least 1 second.");
            }
            else if (intervalSec > 24 * 60 * 60) {
                throw new Error("The sum of 'hour', 'min' and 'sec' shall not exceed 24 hours.");
            }
            const currentTime = {
                hour: 0,
                min: 0,
                sec: 0,
                ...start,
            };
            const limitSec = (end.hour - start.hour) * baseTime.min * baseTime.sec +
                (end.min - start.min) * baseTime.sec +
                (end.sec - start.sec);
            if (limitSec <= 0) {
                throw new Error("The 'end' time must be after 'start' time");
            }
            const timeAry = [];
            let baseSec = 0;
            while (baseSec < limitSec) {
                timeAry.push(JSON.parse(JSON.stringify(currentTime)));
                currentTime.sec += intervalSec;
                if (currentTime.sec >= baseTime.sec) {
                    const overMin = Math.floor(currentTime.sec / baseTime.sec);
                    currentTime.min += overMin;
                    currentTime.sec -= overMin * baseTime.sec;
                }
                if (currentTime.min >= baseTime.min) {
                    const overHour = Math.floor(currentTime.min / baseTime.min);
                    currentTime.hour += overHour;
                    currentTime.min -= overHour * baseTime.min;
                }
                baseSec = baseSec + intervalSec;
            }
            // 0, 0,3,6 1,2
            // 45 0,3,6 1
            // 30 1,4,7 1
            // 15 2,5,8 1
            const timeObj = {};
            timeAry.forEach(({ hour, min, sec }) => {
                if (!timeObj[hour]) {
                    timeObj[hour] = {};
                }
                if (!timeObj[hour][min]) {
                    timeObj[hour][min] = new Set();
                }
                timeObj[hour][min].add(sec);
            });
            const nestMin = {};
            for (const hour in timeObj) {
                let curMin = {};
                let curIndex = 0;
                let curSec;
                for (const min in timeObj[hour]) {
                    const setSec = timeObj[hour][min];
                    if (!curSec)
                        curSec = setSec;
                    if (!isSetEqual(setSec, curSec)) {
                        ++curIndex;
                    }
                    if (curMin[curIndex] === undefined) {
                        curMin[curIndex] = {
                            min: new Set(),
                            sec: setSec,
                            hour: new Set().add(hour),
                            isHourNested: false,
                        };
                    }
                    curMin[curIndex]["min"].add(min);
                }
                nestMin[hour] = Object.values(curMin);
            }
            const nestHourAry = [];
            let curIndex = 0;
            for (const { hour: outerHour, min: outerMin, sec: outerSec, isHourNested, } of Object.values(nestMin).flat()) {
                if (isHourNested)
                    continue;
                nestHourAry.push({ hour: outerHour, min: outerMin, sec: outerSec });
                for (const eachNestMin of Object.values(nestMin).flat()) {
                    const { hour, min, sec } = eachNestMin;
                    if (eachNestMin.isHourNested)
                        continue;
                    if (isSetEqual(min, outerMin) && isSetEqual(sec, outerSec)) {
                        for (const eachHour of hour) {
                            nestHourAry[curIndex].hour.add(eachHour);
                        }
                        eachNestMin.isHourNested = true;
                    }
                }
                ++curIndex;
            }
            const result = nestHourAry.map(({ sec, min, hour }) => ({
                hour: Array.from(hour),
                min: Array.from(min),
                sec: Array.from(sec),
            }));
            return result;
        };
        this.getDayCron = (interval, start, end) => {
            const dayOfMonthAry = [];
            const dayOfWeekAry = [];
            const result = {
                dayOfMonthAry,
                dayOfWeekAry,
            };
            if (!interval.day)
                throw new Error("Need Interval 'day'");
            if (start.dayOfMonth && end.dayOfMonth) {
                dayOfWeekAry.push("*");
                if (start.dayOfMonth === this.startEndRange.dayOfMonth[0] &&
                    end.dayOfMonth === this.startEndRange.dayOfMonth[1] &&
                    interval.day < 2) {
                    dayOfMonthAry.push("*");
                    return result;
                }
                if (end.dayOfMonth - start.dayOfMonth < interval.day - 1)
                    throw new Error("Invalid interval 'day'");
                let curDay = start.dayOfMonth;
                while (curDay <= end.dayOfMonth) {
                    dayOfMonthAry.push(curDay);
                    curDay += interval.day;
                }
                return result;
            }
            if (!start.dayOfWeek || !end.dayOfWeek)
                throw new Error("Need start and end 'dayOfWeek'");
            if (end.dayOfWeek - start.dayOfWeek < interval.day - 1)
                throw new Error("Invalid interval 'day'");
            dayOfMonthAry.push("*");
            let curDay = start.dayOfWeek;
            while (curDay <= end.dayOfWeek) {
                dayOfWeekAry.push(curDay);
                curDay += interval.day;
            }
            return result;
        };
        this.getMonthCron = (interval, start, end) => {
            if (!interval.month)
                throw new Error("Need Interval 'month'");
            if (!end.monthOfYear || !start.monthOfYear)
                throw new Error("Need start and end 'monthOfYear'");
            if (end.monthOfYear - start.monthOfYear < interval.month)
                throw new Error("Invalid interval 'month'");
            const monthAry = [];
            const result = {
                monthAry,
            };
            if (start.monthOfYear === this.startEndRange.monthOfYear[0] &&
                end.monthOfYear === this.startEndRange.monthOfYear[1] &&
                interval.month < 2) {
                monthAry.push("*");
                return result;
            }
            let curMonth = start.monthOfYear;
            while (curMonth <= end.monthOfYear) {
                monthAry.push(curMonth);
                curMonth += interval.month;
            }
            return result;
        };
        this.getCronRaw = (interval, options) => {
            const start = this.validateStartEndInput(true, options ? options.start : undefined);
            const end = this.validateStartEndInput(false, options ? options.end : undefined);
            interval = this.validateIntervalInput(interval);
            const { newStart, newEnd } = this.validateBothStartEndInput(start, end);
            const hmsCronAry = this.getHmsCron(interval, newStart, newEnd);
            const dayCron = this.getDayCron(interval, newStart, newEnd);
            const monthCron = this.getMonthCron(interval, newStart, newEnd);
            return hmsCronAry.map((hms) => ({ ...hms, ...dayCron, ...monthCron }));
        };
        this.getCronStr = (cronRawAry) => {
            const orderKeys = [
                "sec",
                "min",
                "hour",
                "dayOfMonthAry",
                "monthAry",
                "dayOfWeekAry",
            ];
            return cronRawAry.map((cronRaw) => {
                let cronStrAry = [];
                for (const key of orderKeys) {
                    let pushResult = cronRaw[key].join(",");
                    if ((key === "sec" &&
                        pushResult ===
                            "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59") ||
                        (key === "min" &&
                            pushResult ===
                                "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59") ||
                        (key === "hour" &&
                            pushResult ===
                                "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23")) {
                        pushResult = "*";
                    }
                    cronStrAry.push(pushResult);
                }
                return cronStrAry.join(" ");
            });
        };
        this.createCronStr = (interval, options) => {
            const cronAry = this.getCronRaw(interval, options);
            const cronStrAry = this.getCronStr(cronAry);
            return cronStrAry;
        };
        this.createSchedule = (interval, func, options) => {
            const cronAry = this.getCronRaw(interval, options);
            const cronStrAry = this.getCronStr(cronAry);
            return cronStrAry.map((cronStr) => {
                return node_cron_1.default.schedule(cronStr, func, options === null || options === void 0 ? void 0 : options.scheduleOptions);
            });
        };
    }
}
const cronIntervalRange = new CronIntervalRange();
exports.default = cronIntervalRange;
