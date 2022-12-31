import cron from "node-cron";
export declare type CreateCronStrInput = {
    interval: IntervalInput;
    options?: {
        start?: StartEndInput;
        end?: StartEndInput;
    };
};
export declare type CreateScheduleInput = {
    interval: IntervalInput;
    func: (now: Date | "manual") => void;
    options?: {
        start?: StartEndInput;
        end?: StartEndInput;
        scheduleOptions?: cron.ScheduleOptions;
    };
};
export declare type StartEndInput = {
    /**
     * value 1 to 12
     */
    monthOfYear?: number;
    /**
     * value 0 to 23
     */
    hour?: number;
    /**
     * value 0 to 59
     */
    min?: number;
    /**
     * value 0 to 59
     */
    sec?: number;
} & ({
    /**
     * value 1 to 31
     */
    dayOfMonth?: number;
    /**
     * Input value is either 'dayOfMonth' or 'dayOfWeek'
     */
    dayOfWeek?: undefined;
} | {
    /**
     * Input value is either 'dayOfMonth' or 'dayOfWeek'
     */
    dayOfMonth?: undefined;
    /**
     * value 0 to 7 (0 or 7 are sunday)
     */
    dayOfWeek?: number;
});
export declare type IntervalInput = {
    month?: number;
    day?: never;
    hour?: number;
    min?: number;
    sec?: number;
} | {
    month?: never;
    day?: number;
    hour?: number;
    min?: number;
    sec?: number;
};
export declare type CronRawResult = {
    dayOfWeekAry: (number | string)[];
    monthAry: (number | string)[];
    dayOfMonthAry: (number | string)[];
    hour: (number | string)[];
    min: (number | string)[];
    sec: (number | string)[];
};
declare class CronIntervalRange {
    private intervalRange;
    private startEndRange;
    private validValue;
    private validateBothStartEndInput;
    private validateStartEndInput;
    private validateIntervalInput;
    private getHmsCron;
    private getDayCron;
    private getMonthCron;
    private getCronRaw;
    private getCronStr;
    /**
     * Returns an array that contains cron string.
     * @param start Default 00:00:00 EveryDay EveryMonth
     * @param end Default 24:00:00 EveryDay EveryMonth
     * @param interval
     */
    createCronStr: (interval: IntervalInput, options?: {
        start?: StartEndInput | undefined;
        end?: StartEndInput | undefined;
    } | undefined) => string[];
    /**
     * Returns an array that contains cron schedule.
     * @param start Default 00:00:00 EveryDay EveryMonth
     * @param end Default 24:00:00 EveryDay EveryMonth
     * @param interval
     */
    createSchedule: (interval: IntervalInput, func: (now: Date | "manual") => void, options?: {
        start?: StartEndInput | undefined;
        end?: StartEndInput | undefined;
        scheduleOptions?: cron.ScheduleOptions | undefined;
    } | undefined) => Array<cron.ScheduledTask>;
}
declare const cronIntervalRange: CronIntervalRange;
export default cronIntervalRange;
