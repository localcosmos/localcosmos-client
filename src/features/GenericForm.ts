import { FeatureBase } from "../Features";
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
  FixedTaxonWidget = 'FixedTaxonWidget',
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
  initial: unknown, // initial selected value
  unit?: string,
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
