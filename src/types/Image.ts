export type ImageLicence = {
    licence: string,
    licenceVersion: string,
    creatorName: string,
    creatorLink: string,
    sourceLink: string,
}

export type ImageUrls = {
    '1x': string,
    '2x': string, 
    '4x'?: string,
    '8x'?: string,
}

export type ImageWithTextAndLicence = {
    imageUrl: ImageUrls,
    text?: string,
    licence?: ImageLicence,
    altText?: string,
    title?: string,
}
