export enum SupportedGeometries {
  Point = 'Point'
}

export enum SupportedCRS {
  epsg4326 = 'EPSG:4326'
}

export interface CRSProperties {
  name: SupportedCRS
}

export interface CRS {
  type: string,
  properties: CRSProperties,
}

export type Geometry = {
  type: SupportedGeometries
  coordinates: number[], //lng, lat
  crs: CRS
}

export enum GeoJSONFeatureType {
  Feature = 'Feature',
  FeatureCollection = 'FeatureCollection',
}

interface PointProperties {
  accuracy: number
}

export type GeoJSONFeature = {
  type: GeoJSONFeatureType,
  geometry: Geometry,
  properties?: PointProperties,
}

export type GeoJSONFeatureCollection = {
  type: GeoJSONFeatureType,
  features: GeoJSONFeature[],
}

export const pointLatLngToFeature = (lat: number, lng: number, accuracy?:number): GeoJSONFeature => {
  const feature = {
    type: GeoJSONFeatureType.Feature,
    geometry: {
      type: SupportedGeometries.Point,
      coordinates: [
        lng,
        lat,
      ],
      crs: {
        type: 'name',
        properties: {
          name: SupportedCRS.epsg4326,
        },
      },
    },
    properties : {}
  } as GeoJSONFeature;

  if (typeof accuracy === 'number') {
    feature.properties = {
      'accuracy' : accuracy
    }
  }

  return feature;
}