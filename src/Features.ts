/**
 * This file describes a generated features.json file that is generated by an app-kit build server
 */
export type FeatureType = 'Frontend' | 'BackboneTaxonomy' | 'TaxonProfiles' | 'NatureGuide' | 'GenericForm'

export type FeatureReference = {
  model: FeatureType
  uuid: string
  action: string // todo: type unknown
}

export type Feature = {
  genericContentType: FeatureType
  uuid: string
  name: { [locale: string]: string }
  version: number
  path: string
  folder: string
  slug: string
}

export type DetailFeature = {
  uuid: string,
  version: number
  options: any // todo: type unknown
  globalOptions: any // todo: type unknown
  name: string,
  slug: string
}

type ListFeature = {
  list: Feature[],
  lookup: Record<string, string>
}

export type NatureGuideFeature = Feature & {
  startNodeSlug: string
  imageUrl: string
}

export type Features = {
  slugs: Record<string, string>,
  Frontend?: Feature,
  Glossary?: Feature,
  BackboneTaxonomy?: Feature,
  NatureGuide?: ListFeature,
  GenericForm?: ListFeature,
  TaxonProfiles?: Feature,
  TemplateContent?: Feature,
}