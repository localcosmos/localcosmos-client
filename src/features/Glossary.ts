/**
 * This type describes the file /localcosmos/features/Glossary/{uuid}/{language_code}/glossary.json
 */
import { FeatureBase, GlossaryFeature } from "../types/Features";
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

  glossaryFeature: GlossaryFeature;
  glossary: GlossaryComponent | null = null;
  private localizedGlossaryCache: { [lang: string]: LocalizedGlossary } = {};

  constructor(glossaryFeature: GlossaryFeature) {
    this.glossaryFeature = glossaryFeature;
  }

  async load(): Promise<void> {
    const glossaryResponse = await fetch(this.glossaryFeature.path);
    const glossaryData = await glossaryResponse.json() as GlossaryComponent;
    this.glossary = glossaryData;
  }

  async getLocalizedGlossary(languageCode: string): Promise<LocalizedGlossary|null> {
    if (this.localizedGlossaryCache[languageCode]) {
      return this.localizedGlossaryCache[languageCode];
    }
    if (!this.glossary || !(languageCode in this.glossaryFeature.localized)) {
      return null;
    }
    const url = this.glossaryFeature.localized[languageCode].allTerms;
    const localizedGlossaryResponse = await fetch(url);
    const localizedGlossary = await localizedGlossaryResponse.json() as LocalizedGlossary;
    this.localizedGlossaryCache[languageCode] = localizedGlossary;
    return localizedGlossary;
  }

  /** get untranslated definition  */
  definition(key: string): string {
    const term = this.decodeBase64UTF8(key);
    if (this.glossary && term in this.glossary.glossary) {
      const glossaryEntry = this.glossary.glossary[term];
      return glossaryEntry.definition;
    }

    return '';
  }

  /**
   * Properly decode base64 encoded UTF-8 strings (handles umlauts and other special characters)
   */
  private decodeBase64UTF8(str: string): string {
    try {
      // Modern approach: decode base64 to bytes, then decode as UTF-8
      const bytes = Uint8Array.from(window.atob(str), c => c.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
      // Fallback: try direct atob (for backward compatibility)
      try {
        return window.atob(str);
      } catch (e2) {
        console.error('Failed to decode base64 string:', str, e2);
        return str; // Return original string if decoding fails
      }
    }
  }

  searchTerm(searchText: string): GlossaryEntry[] {
    if (!this.glossary) {
      return [];
    }

    const searchLower = searchText.toLowerCase();
    const results: GlossaryEntry[] = [];

    for (const key in this.glossary.glossary) {
      const entry = this.glossary.glossary[key];
      if (entry.definition.toLowerCase().includes(searchLower) || 
          entry.synonyms.some(synonym => synonym.toLowerCase().includes(searchLower))) {
        results.push(entry);
      }
    }

    return results;
  }

  /**
   * Search for terms in the localized glossary.
   */
  async searchLocalizedGlossary(searchText: string, languageCode: string): Promise<Array<{ term: string, entry: GlossaryEntry }>> {
    const localizedGlossary = await this.getLocalizedGlossary(languageCode);
    if (!localizedGlossary) {
      return [];
    }

    const searchLower = searchText.toLowerCase();
    const results: Array<{ term: string, entry: GlossaryEntry }> = [];

    for (const startLetter in localizedGlossary) {
      const terms = localizedGlossary[startLetter];
      for (const term in terms) {
        const entry = terms[term];
        if (
          term.toLowerCase().includes(searchLower) ||
          entry.definition.toLowerCase().includes(searchLower) ||
          entry.synonyms.some(synonym => synonym.toLowerCase().includes(searchLower))
        ) {
          results.push({ term, entry });
        }
      }
    }

    return results;
  }

  /**
   * Search for terms in the localized glossary.
   */
  async searchLocalizedTerms(searchText: string, languageCode: string): Promise<Array<{ term: string, entry: GlossaryEntry }>> {
    const localizedGlossary = await this.getLocalizedGlossary(languageCode);
    if (!localizedGlossary) {
      return [];
    }

    const searchLower = searchText.toLowerCase();
    const startsWithResults: Array<{ term: string, entry: GlossaryEntry }> = [];
    const includesResults: Array<{ term: string, entry: GlossaryEntry }> = [];

    for (const startLetter in localizedGlossary) {
      const terms = localizedGlossary[startLetter];
      for (const term in terms) {
        const termLower = term.toLowerCase();
        if (termLower.startsWith(searchLower)) {
          startsWithResults.push({ term, entry: terms[term] });
        } else if (termLower.includes(searchLower)) {
          includesResults.push({ term, entry: terms[term] });
        }
      }
    }

    return [...startsWithResults, ...includesResults];
  }

}