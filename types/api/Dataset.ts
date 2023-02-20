import {GenericForm} from "../features/GenericForm";
import {TaxonReference} from "../features/TaxonProfile";

export type DatasetTemporalValue = {
  cron: {
    timestamp: number
  }
}

export type DatasetValue = string | number | object | DatasetTemporalValue | File // todo add GeoJson Value + other object types specifically

export type Dataset = {
  uuid?: string,
  observationForm: GenericForm,
  data: Record<string, DatasetValue>,
}

export type ReadOnlyDataset = {
  coordinates: string,
  geographicReference: string | any,
  isPublished: boolean,
  isValid: boolean,
  taxon: TaxonReference,
  timestamp: string,
  user: string,
  uuid: string,
  validationStep: 'completed' | string, // todo: unknown more
}

export type DatasetCreateRequest = {
  data: Record<string, DatasetValue>,
  clientId: string,
  platform: string,
  createdAt: string,
  observationForm: {
    uuid: string
    version: number,
  },
}

export type DatasetListResponse = {
  count: number,
  results: ReadOnlyDataset[],
}
