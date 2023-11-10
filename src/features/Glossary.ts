/**
 * This type describes the file /localcosmos/features/Glossary/{uuid}/{language_code}/glossary.json
 */
import { FeatureBase } from "../types/Features";
import { ImageWithTextAndLicence } from "../types/Image";

export type GlossaryEntry = {
  definition: string,
  synonyms: string[],
  imageUrl: ImageWithTextAndLicence,
}

/**
 * This type describes the file /localcosmos/features/Glossary/{uuid}/{uuid}.json
 */
 export type GlossaryComponent = FeatureBase & {
  glossary: Record<string, GlossaryEntry>
}

/**
 * This type describes the file /localcosmos/features/Glossary/{uuid}/{language_code}/glossary.json
 */
export type LocalizedGlossary = {
  [x: string]: Record<string, GlossaryEntry>
};

export class Glossary {

  glossary: GlossaryComponent

  constructor(glossary: GlossaryComponent) {
    this.glossary = glossary;
  }

  definition(key: string): string {
    const term = window.atob(key);
    if (term in this.glossary.glossary) {
      const glossaryEntry = this.glossary.glossary[term];
      return glossaryEntry.definition;
    }

    return '';
  }

}