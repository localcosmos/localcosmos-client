export enum TimeTypes {
  unixtime = 'timestamp'
}

export interface UnixtimeWithTimezone {
  type: 'timestamp'
  format: 'unixtime',
  timestamp: number,
  timezoneOffset: number,
}

export type TemporalJson = {
  type: string,
  cron: UnixtimeWithTimezone
}