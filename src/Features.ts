/**
 * This file describes a features.json file that is generated by a Local Cosmos App Kit
 */
 import { TaxonomicRestriction } from "./features/BackboneTaxonomy";

 export enum FeatureType {
   Frontend = 'Frontend',
   BackboneTaxonomy = 'BackboneTaxonomy',
   TaxonProfiles = 'TaxonProfiles',
   NatureGuide = 'NatureGuide',
   GenericForm = 'GenericForm',
   Map = 'Map',
   TemplateContent = 'TemplateContent',
 }

 export type FeatureBase = {
  uuid: string,
  version: number
  options?: Record<string, any> | null,
  globalOptions?: Record<string, any> | null,
  name: string,
  slug: string,
}

 export type Feature = FeatureBase & {
  genericContentType: FeatureType,
  description: string,
  path: string,
  folder: string,
  taxonomicRestrictions?: TaxonomicRestriction[],
}

export type ListFeature = {
  list: Feature[],
  lookup: Record<string, string>
}

export type BackboneTaxonomyFeature = Feature & {
  vernacular: { 
    [locale: string]: string
  },
  alphabet: string,
}

export type GenericFormFeature = Feature & {
  isDefault: boolean
}

export type TaxonProfilesFeature = Feature & {
  files: string,
  localizedRegistries: {
    [locale: string]: string,
  },
  registry: string,
  search: string,
}

export type NatureGuideFeature = Feature & {
  startNodeUuid: string,
  startNodeSlug: string,
  imageUrl: Record<string, string>,
}

export type TemplateContentFeature = ListFeature & {
  assignments: {
    string: Record<string,string>
  },
  navigations: Record<string, any>
}

export type NatureGuideListFeature = {
  list: NatureGuideFeature[],
  lookup: Record<string, string>,
}

export type GenericFormListFeature = {
  list: GenericFormFeature[],
  lookup: Record<string, string>,
  default: Record<string, string>,
}

export type Features = {
  slugs: Record<string, string>,
  Frontend: Feature,
  BackboneTaxonomy: BackboneTaxonomyFeature,
  TaxonProfiles: Feature,
  NatureGuide?: NatureGuideListFeature,
  GenericForm?: GenericFormListFeature,
  Map?: Feature,
  TemplateContent?: Feature,
  Glossary?: Feature,
}
