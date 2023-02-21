// todo: this is wip, taxon type is wrong, not exporting a detailfeature

import { Image } from '../Image';
import { MatrixFilter } from './NatureGuide';
import { GenericFormReference } from './GenericForm';

export type TaxonImageSet = {
  taxonProfileImages: Image[]
  nodeImages: Image[]
  taxonImages: Image[]
}

export type TraitValue = {
  encodedSpace: string
  imageUrl: string
}

export type Trait = {
  matrixFilter: MatrixFilter
  values: TraitValue[]
}

export type TaxonText = {
  taxonTextType: string
  shortText: string,
  shortTextKey: string
  longText: string
  longTextKey: string
}

export type Taxon = {
  nameUuid: string
  taxonNuid: string
  taxonAuthor: string
  taxonSource: string
  taxonLatname: string
  vernacular: { [locale: string]: string }
  allVernacularNames: { [locale: string]: string }
  nodeNames: string[]
  nodeDecisionRules: any // todo: unknown
  traits: Trait[]
  texts: TaxonText[]
  images: TaxonImageSet
  synonyms: string[]
  gbifNubKey: string
  genericForms?: GenericFormReference[]
  templateContents?: object[]
  tags: string[]
}

export type TaxonReference = {
  nameUuid: string
  taxonSource: string
  taxonLatname: string
  taxonAuthor: string
  taxonNuid: string
  vernacularNames: { [locale: string]: string }
  alternativeVernacularNames: { [locale: string]: string }
  images: TaxonImageSet
}

export type SearchableTaxonReference = TaxonReference & {
  name: string,
  imageUrl: string | null,
}

export function taxonToReference (taxon: Taxon): Partial<TaxonReference> {
  return {
    nameUuid: taxon.nameUuid,
    taxonSource: taxon.taxonSource,
    taxonLatname: taxon.taxonLatname,
    taxonAuthor: taxon.taxonAuthor,
    taxonNuid: taxon.taxonNuid,
  };
}
