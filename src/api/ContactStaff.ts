export type ContactStaffRequest = {
    name: string,
    email: string,
    subject: string | null,
    message: string,
    page: string,
    website: string | null, // honeypot field
}