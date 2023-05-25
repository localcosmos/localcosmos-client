
export type Geometry  = {}

export enum GeoJSONFeatureType {
    Feature = 'Feature',
    FeatureCollection = 'FeatureCollection',
}

export type GeoJSONFeature = {
    type: GeoJSONFeatureType.Feature
    properties: Record<string,string>,
    geometry: Geometry,
}

export type GeoJSONFeatureCollection = {
    type: GeoJSONFeatureType.FeatureCollection,
    features: GeoJSONFeature[],
}