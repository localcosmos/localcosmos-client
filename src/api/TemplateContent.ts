export type TemplateContentData = {
    title: string,
    autho: string,
    templateName: string
    version: number,
    contents: Record<string,string>,
}

export type TemplateContentLink = {
    pk : string,
    slug: string,
    templateName: string,
    title: string,
    author: string,
    url: string,
}