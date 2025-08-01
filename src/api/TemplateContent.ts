export type TemplateContentData = {
    title: string,
    templateName: string
    templatePath: string
    version: number,
    contents: Record<string,string>,
}

export type TemplateContentLink = {
    pk : string,
    slug: string,
    templateName: string,
    title: string,
    url: string,
}