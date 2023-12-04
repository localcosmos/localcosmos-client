export type CreateLogEntryRequest = {
    eventType: string,
    eventContent?: string,
    platform?: string,
    appVersion?: string,
}