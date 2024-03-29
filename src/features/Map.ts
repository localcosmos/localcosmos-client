/**
 * This file describes a localcosmos/features/Map/{uuid}/{uuid}.json file that is generated by Local Cosmos App Kit
 */
import { FeatureBase } from '../types/Features';
import { TaxonType } from './BackboneTaxonomy';
import { GeoJSONFeatureCollection } from '../types/GeoJSON';

export type MapOptions = {
  initialZoom: number,
  initialLatitude: number,
  initialLongiture: number,
  includeObservationFormsAsFilters: boolean,
}

export enum MapTypes {
  observations = 'observations'
}

export type MapTaxonomicFilter = {
  name: string,
  taxa: TaxonType[],
  position: number,
}

export type MapObservationFormFilter = {
  observationFormUuid: string,
  name: string,
}

export type Map = FeatureBase & {
  options: MapOptions,
  mapType: MapTypes,
  geometries: {
    projectArea?: GeoJSONFeatureCollection,
  },
  taxonomicFilters: MapTaxonomicFilter[],
  observationFormFilters: MapObservationFormFilter[]
}