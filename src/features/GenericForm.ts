import { TaxonReference } from './Taxon';
import {DetailFeature} from "~/types/localcosmos/types/Features";

export type GenericFormFieldWidgetType = 'BackboneTaxonAutocompleteWidget' | 'MobilePositionInput' | 'SelectDateTimeWidget' | 'CameraAndAlbumWidget' | 'CheckboxInput' | 'TextInput' | 'Textarea' | 'MobileNumberInput' | 'CheckboxSelectMultiple' | 'Select'
export type GenericFormFieldType = 'TaxonField' | 'PointJSONField' | 'GeoJSONField' | 'DateTimeJSONField' | 'PictureField' | 'BooleanField' | 'CharField' | 'DecimalField' | 'FloatField' | 'IntegerField' | 'MultipleChoiceField' | 'ChoiceField'
export type GenericFormFieldRole = 'taxonomic_reference' | 'geographic_reference' | 'temporal_reference' | 'regular'

export type TaxonomicRestriction = Omit<TaxonReference, 'vernacularNames' | 'alternativeVernacularNames'> & {
  restrictionType: 'exists' // todo: missing type options
}

export type GenericFormFieldDefinition = {
  widget: GenericFormFieldWidgetType,
  required: boolean,
  isSticky: boolean,
  label: string,
  helpText: string,
  initial: unknown, // initial selected value
  choices?: string[][], // options for select type [[key, value], ...]
}

export type GenericFormField = {
  uuid: string,
  fieldClass: GenericFormFieldType,
  version: number,
  role: GenericFormFieldRole,
  definition: GenericFormFieldDefinition,
  position: number,
  options: object, // todo: missing type info
  widgetAttrs: Record<string, unknown>, // html-attributes for the input field
  taxonomicRestrictions: TaxonomicRestriction[],
}

export type GenericForm = DetailFeature & {
  fields: GenericFormField[],
  taxonomicRestrictions: TaxonomicRestriction[],
  taxonomicReference: string,
  temporalReference: string,
  geographicReference: string,
  isMulticontent: boolean,
  isDefault: boolean,
}

export type GenericFormReference = Pick<GenericForm, 'uuid' | 'name' | 'slug' | 'taxonomicRestrictions'>;
