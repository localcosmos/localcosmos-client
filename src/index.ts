/**
 * Basic Types:
 */
export type { ImageUrls, ImageWithTextAndLicence } from './types/Image';

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
  NatureGuideFeature,
  NatureGuideListFeature,
  GenericFormFeature,
  GenericFormListFeature,
  TemplateContentFeature,
  TaxonProfilesFeature,
  GlossaryFeature,
} from './types/Features';

export { FeatureType } from './types/Features';
/**
 * Definitions for explicit file of components in their corresponding folders
 */
export type { GenericForm } from './features/GenericForm';
export type { Frontend } from './features/Frontend';
export type { Map } from './features/Map';

/**
 * Component specific types
 */
export type { GenericFormField, WidgetAttrs } from './features/GenericForm';
export type {
  VernacularNamesLookup,
  SearchTaxonList,
  SearchTaxon,
  TaxonType,
  TaxonWithImage,
  VernacularTaxonType,
  TaxonomicRestriction,
  RestrictionType
} from './features/BackboneTaxonomy';
export type { TemporalJson } from './types/DateTime';
export type { GeoJSONFeature } from './types/GeoJSON';
export type {
  Dataset,
  ReadOnlyDataset,
  DatasetReadOnlyImage,
  DatasetFilter,
  DatasetFilterRequest
} from './api/Dataset';
export type { MapTaxonomicFilter, MapObservationFormFilter } from './features/Map';
export type {
  TaxonProfile,
  TaxonProfilesSearchIndex,
  TaxonText,
  TaxonProfilesNavigation,
  TaxonProfilesNavigationNode,
} from './features/TaxonProfiles';
export type { GlossaryEntry } from './features/Glossary';
export type {
  IdentificationKeyReference,
  DescriptiveTextAndImagesFilterSpace,
  ColorFilterSpace,
  TextOnlyFilterSpace,
  TaxonFilterSpace,
  MatrixFilterDefinition,
} from './features/NatureGuide';
export type {
  Page,
  TemplateContentNavigationEntry,
  TemplateContentNavigation,
  TemplateContentComponent,
  LicencedTemplateContentImage,
} from './features/TemplateContent';
/**
 * Usable classes, functions and enums of components
 */
export { GenericFormFieldType, GenericFormFieldWidgetType, GenericFormFieldRole } from './features/GenericForm';
export { Glossary } from './features/Glossary';
export { BackboneTaxonomy } from './features/BackboneTaxonomy';
export { TaxonProfiles } from './features/TaxonProfiles';
export { dateTimeToTemporalJson, Operators } from './api/Dataset';
export { pointLatLngToFeature, SupportedGeometries, SupportedCRS, GeoJSONFeatureType } from './types/GeoJSON';
export { Taxon } from './Taxon';
export { GenericValueManager } from './api/GenericValueManager';
export {
  NatureGuide,
  IdentificationKey,
  IdentificationEvents,
  MatrixFilter,
  MatrixFilterSpace,
  IdentificationModes,
  MatrixFilterType,
  IdentificationMeans,
  NodeTypes,
  ResultActions,
} from './features/NatureGuide';
export { ComponentTypes } from './features/TemplateContent'

export { MapTypes } from './features/Map';

export { LicenceRegistry } from './legal/LicenceRegistry';

/**
 * Definitions for Api Requests and Responses
 */
export type {
  DatasetListResponse,
  DatasetListEntry,
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