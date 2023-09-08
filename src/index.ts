/**
 * Basic Types:
 */
export type { ImageUrls } from './types/Image';

/**
 * Definitions for the Settings.json file:
 */
export type { FrontendSettings } from './types/Settings';

/**
 * Definitions for features.json and all subtypes:
 */
 export type {
  Feature,
  Features,
  BackboneTaxonomyFeature,
  NatureGuideListFeature,
  GenericFormListFeature,
  TemplateContentFeature,
} from './types/Features';

/**
 * Definitions for explicit file of components in their corresponding folders
 */
export type { NatureGuide } from './features/NatureGuide';
export type { GenericForm } from './features/GenericForm';
export type { Frontend } from './features/Frontend';
export type { Map } from './features/Map';

/**
 * Component specific types
 */
export type { GenericFormField, WidgetAttrs } from './features/GenericForm';
export type {
  VernacularNamesLookup,
  TaxonType,
  VernacularTaxonType,
  TaxonomicRestriction,
  RestrictionType
} from './features/BackboneTaxonomy';
export type { TemporalJson } from './types/DateTime';
export type { GeoJSONFeature } from './types/GeoJSON';
export type { ReadOnlyDataset, DatasetReadOnlyImage } from './api/Dataset';
export type { MapTaxonomicFilter } from './features/Map';

/**
 * Usable classes, functions and enums of components
 */
export { GenericFormFieldType, GenericFormFieldWidgetType } from './features/GenericForm';
export { Glossary } from './features/Glossary';
export { BackboneTaxonomy } from './features/BackboneTaxonomy';
export { TaxonProfiles } from './features/TaxonProfiles';
export { dateTimeToTemporalJson } from './api/Dataset';
export { pointLatLngToFeature } from './types/GeoJSON';
export { Taxon } from './Taxon';
export { GenericValueManager } from './api/GenericValueManager';

/**
 * Definitions for Api Requests and Responses
 */
export type {
  DatasetListResponse,
  DatasetCreateRequest,
} from './api/Dataset';

export type {
  ObservationFormCreateRequest,
} from './api/ObservationForm';

export type {
  UserGeometry,
} from './api/UserGeometry';

export type {
  PasswordReset,
  Registration,
  LocalcosmosUser,
  TokenBlacklist,
  TokenRefresh,
  TokenObtainPairSerializerWithClientID,
} from './api/Authentication';

export type {
  LocalcosmosPublicUser
} from './api/PublicUser';
/**
 * API
 */
export type {
  LCApiRequestResult,
  ServerErrorTypes
} from './api/LocalCosmosApi';

export {
  LCApiResultTypes,
  LocalCosmosApi
} from './api/LocalCosmosApi';

export type {
  ProfilePicture,
  CropParameters,
} from './api/ProfilePicture';