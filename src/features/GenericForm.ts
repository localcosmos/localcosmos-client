import { FeatureBase } from "../types/Features";
import { TaxonomicRestriction } from "./BackboneTaxonomy";

export enum GenericFormFieldWidgetType {
  BackboneTaxonAutocompleteWidget = 'BackboneTaxonAutocompleteWidget',
  MobilePositionInput = 'MobilePositionInput',
  SelectDateTimeWidget = 'SelectDateTimeWidget',
  CameraAndAlbumWidget = 'CameraAndAlbumWidget',
  CheckboxInput = 'CheckboxInput',
  TextInput = 'TextInput',
  Textarea = 'Textarea',
  MobileNumberInput = 'MobileNumberInput',
  CheckboxSelectMultiple = 'CheckboxSelectMultiple',
  Select = 'Select',
  PointOrAreaInput = 'PointOrAreaInput',
  FixedTaxonWidget = 'FixedTaxonWidget',
  SelectTaxonWidget = 'SelectTaxonWidget',
}

export enum GenericFormFieldType {
  TaxonField = 'TaxonField',
  PointJSONField = 'PointJSONField',
  GeoJSONField = 'GeoJSONField',
  DateTimeJSONField = 'DateTimeJSONField',
  PictureField = 'PictureField',
  BooleanField = 'BooleanField',
  CharField = 'CharField',
  DecimalField = 'DecimalField',
  FloatField = 'FloatField',
  IntegerField = 'IntegerField',
  MultipleChoiceField = 'MultipleChoiceField',
  ChoiceField = 'ChoiceField',
  SelectTaxonField = 'SelectTaxonField',
}

export enum GenericFormFieldRole {
  taxonomicReference = 'taxonomicReference',
  geographicReference = 'geographicReference',
  temporalReference = 'temporalReference',
  regular = 'regular',
}

export type WidgetAttrs = {
  min: number,
  max: number,
  step: number
}

export type GenericFormFieldDefinition = {
  widget: GenericFormFieldWidgetType,
  required: boolean,
  isSticky: boolean,
  label: string,
  helpText: string,
  initial: any,
  unit?: string,
  mode?: string,
  choices?: string[][], // options for select type [[key, value], ...]
}

export type GenericFormField = {
  uuid: string,
  fieldClass: GenericFormFieldType,
  version: number,
  role: GenericFormFieldRole,
  definition: GenericFormFieldDefinition,
  position: number,
  widgetAttrs: WidgetAttrs,
  taxonomicRestrictions: TaxonomicRestriction[],
}


/**
 * this type describes a file /localcosmos/features/Genericform/{uuid}/{uuid}.json
 */
export type GenericForm = FeatureBase & {
  fields: GenericFormField[],
  taxonomicRestrictions: TaxonomicRestriction[],
  taxonomicReference: string,
  temporalReference: string,
  geographicReference: string,
  isMulticontent: boolean,
  isDefault: boolean,
}

export type GenericFormReference = Pick<GenericForm, 'uuid' | 'name' | 'slug' | 'taxonomicRestrictions'>;
