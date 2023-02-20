import { DetailFeature } from "../Features";
import { TaxonReference } from "./TaxonProfile";

export type MatrixFilterSpaceReference = {
  spaceIdentifier: string,
  encodedSpace: any,
}

export type MatrixFilterSpace = {
  spaceIdentifier: string
  encodedSpace: any
  html?: string
}

export type DescriptiveTextAndImagesFilterSpace = MatrixFilterSpace
export type ColorFilterSpace = MatrixFilterSpace
export type TextOnlyFilterSpace = MatrixFilterSpace
export type TaxonFilterSpace = MatrixFilterSpace

export type MatrixFilterType =
  'DescriptiveTextAndImagesFilter'
  | 'TextOnlyFilter'
  | 'ColorFilter'
  | 'RangeFilter'
  | 'NumberFilter'
  | 'TaxonFilter';

type MatrixFilterRestriction = {
  spaceIdentifier: string
  encodedSpace: string
}

export type MatrixFilter = {
  uuid: string
  index: number
  type: MatrixFilterType
  name: string
  description: string | null
  weight: number
  allowMultipleValues: boolean
  definition: object
  restrictions: Record<string, MatrixFilterRestriction[]>
  identificationKey: IdentificationKey
  position?: number
}

export enum IdentificationEvents {
  spaceInitialized = 'spaceInitialized',
  beforeSpaceSelected = 'beforeSpaceSelected',
  spaceSelected = 'spaceSelected',
  spaceDeselected = 'spaceDeselected',
}

export type IdentificationEventCallback = {
  (eventType: string, identificationKey: IdentificationKey, ...payload: any): void;
}

export enum NodeTypes {
  node = 'node',
  result = 'result',
}

export enum IdentificationModes {
  fluid = 'fluid',
  strict = 'strict',
}

export type IdentificationKeyReference = {
  uuid: string
  nodeType: NodeTypes
  imageUrl: string // todo: is this actually a lookup dict? 1x, 2x, 4x?
  space: Record<string, MatrixFilterSpaceReference[]>,
  maxPoints: number
  isVisible: boolean
  name: string
  decisionRule: string
  taxon: TaxonReference | null
  factSheets: any[] // todo: missing type info
  slug: string
}

export type IdentificationKey = {
  name: string,
  taxon: TaxonReference | null,
  children: IdentificationKeyReference[],
  identificationMode: IdentificationModes,
  childrenCount: number,
  factSheets: any[], // todo: missing type info
  slug: string,
  overviewImage: string,
  matrixFilters: Record<string, MatrixFilter>,
}

export type ResultAction = {
  feature: 'TaxonProfiles' | 'GenericForm',
  uuid: string,
}

export type NatureGuideOptions = {
  resultAction: ResultAction
}

export type NatureGuide = DetailFeature & {
  options: NatureGuideOptions,
  crossLinks: any, // todo: missing type info
  startNodeUuid: string,
  isMulticontent: boolean,
  slugs: Record<string, string>,
  tree: Record<string, IdentificationKey>,
}