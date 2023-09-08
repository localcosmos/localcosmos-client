import {GenericForm} from "../features/GenericForm";

export type ObservationFormCreateRequest = {
  uuid: string,
  version: number,
  definition: GenericForm,
}

export type ObservationFormReference = {
  uuid: string,
  version: number,
}