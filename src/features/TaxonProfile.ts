import { Taxon } from './BackboneTaxonomy';
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

export type TaxonProfile = Taxon & {
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

export type TaxonReference = Taxon & {
  vernacularNames: { [locale: string]: string }
  alternativeVernacularNames: { [locale: string]: string }
  images: TaxonImageSet
}

export type LocalizedTaxonReference = TaxonReference & {
  name: string,
  imageUrl: string | null,
}

export function taxonToReference (taxonProfile: TaxonProfile): Taxon | undefined {
  if (!taxonProfile) {
    return;
  }

  return {
    nameUuid: taxonProfile.nameUuid,
    taxonSource: taxonProfile.taxonSource,
    taxonLatname: taxonProfile.taxonLatname,
    taxonAuthor: taxonProfile.taxonAuthor,
    taxonNuid: taxonProfile.taxonNuid,
  };
}
