export type ImageLicence = {
    licence: string,
    licenceVersion: string,
    creatorName: string,
    creatorLink: string,
    sourceLink: string,
}

export type ImageUrls = {
    text?: string,
    imageUrl: { 
        '1x': string,
        '2x': string, 
        '4x'?: string,
        '8x'?: string,
    },
    licence?: ImageLicence,
}
