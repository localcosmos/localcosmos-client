import { GenericForm } from "../features/GenericForm";
import { TaxonType } from "../features/BackboneTaxonomy";

import { TemporalJson } from "../types/DateTime";
import { GeoJSONFeature } from "../types/GeoJSON";
import { LocalcosmosPublicUser } from "./PublicUser";
import { ObservationFormReference } from "./ObservationForm";
import { ImageUrls } from "../types/Image";
import { Taxon } from "../Taxon";

export type DatasetValue = string | number | object | TemporalJson | File // todo add GeoJson Value + other object types specifically

export type Dataset = {
  uuid?: string,
  observationForm: GenericForm,
  data: Record<string, DatasetValue>,
}


export type DatasetReadOnlyImage = {
  id: number,
  dataset: string,
  clientId: string,
  fieldUuid: string,
  image: string,
  imageUrl: ImageUrls,
}

export type ReadOnlyDataset = {
  uuid: string,
  observationForm: ObservationFormReference,
  data: Record<string, any>;
  coordinates: GeoJSONFeature,
  timestamp: string,
  taxonSource: string,
  taxonLatname: string,
  taxonAuthor: string,
  nameUuid: string,
  taxonNuid: string,
  images: Record<string,DatasetReadOnlyImage[]>,
  user: LocalcosmosPublicUser | null,
  validationStep: string,
}

export type DatasetCreateRequest = {
  data: Record<string, DatasetValue>,
  clientId: string,
  platform: string,
  observationForm: {
    uuid: string
    version: number,
  },
}

export type DatasetListEntry = {
  coordinates: GeoJSONFeature,
  geographicReference: GeoJSONFeature,
  isPublished: boolean,
  isValid: boolean,
  taxon: Taxon,
  timestamp: string,
  user: LocalcosmosPublicUser | null,
  uuid: string,
  validationStep: string,
  image: ImageUrls,
}

export type DatasetListResponse = {
  count: number,
  results: DatasetListEntry[],
}

export const dateTimeToTemporalJson = (dateTime: Date):TemporalJson => {
  const jsonTime: TemporalJson = {
    type: 'Temporal',
    cron: {
      type: 'timestamp',
      format: 'unixtime',
      timestamp: dateTime.getTime(),
      timezoneOffset: dateTime.getTimezoneOffset(),
    }
  };

  return jsonTime
};
