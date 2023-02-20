import {GenericForm} from "../features/GenericForm";

export type ObservationFormCreateRequest = {
  uuid: string,
  version: string,
  definition: GenericForm,
}