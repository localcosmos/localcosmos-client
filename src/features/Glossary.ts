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
  // glossary: Record<string, GlossaryEntry> removed in recent version
}

/**
 * This type describes the file /localcosmos/features/Glossary/{uuid}/{language_code}/glossary.json
 */
export type LocalizedGlossary = {
  [x: string]: Record<string, GlossaryEntry>
};

export type GlossarySearchResult = {
  term: string,
  entry: GlossaryEntry,
}

export type GlossarySearchResults = GlossarySearchResult[];

export class Glossary {

  glossaryFeature: GlossaryFeature;
  glossary: LocalizedGlossary | null = null;
  private localizedGlossaryCache: { [lang: string]: LocalizedGlossary } = {};
  loadedLanguage: string | null = null;

  constructor(glossaryFeature: GlossaryFeature) {
    this.glossaryFeature = glossaryFeature;
  }

  async load(languageCode: string): Promise<void> {
    const localizedGlossary = await this.getLocalizedGlossary(languageCode);
    if (localizedGlossary) {
      this.loadedLanguage = languageCode;
    }
  }

  async getLocalizedGlossary(languageCode: string): Promise<LocalizedGlossary|null> {
    if (this.localizedGlossaryCache[languageCode]) {
      return this.localizedGlossaryCache[languageCode];
    }

    if (!(this.glossaryFeature.localized[languageCode])) {
      console.warn(`Glossary does not have localized version for language code: ${languageCode}`);
      console.log(this.glossaryFeature.localized);
      return null;
    }
    const url = this.glossaryFeature.localized[languageCode].allTerms;
    const localizedGlossaryResponse = await fetch(url);
    const localizedGlossary = await localizedGlossaryResponse.json() as LocalizedGlossary;
    this.localizedGlossaryCache[languageCode] = localizedGlossary;
    this.glossary = localizedGlossary;
    return localizedGlossary;
  }

  async getGlossaryByCategory(category: string, languageCode: string): Promise<LocalizedGlossary|null> {

    if (this.glossaryFeature.categorized[category] && this.glossaryFeature.categorized[category][languageCode]) {
      const url = this.glossaryFeature.categorized[category][languageCode];
      const response = await fetch(url);
      const glossaryByCategory = await response.json() as LocalizedGlossary;
      return glossaryByCategory;
    }
    return null;
  }

  /** get definition  */
  definition(key: string): string {
    const term = this.decodeBase64UTF8(key);

    if (key.length === 0) {
      return '';
    }

    const startLetter = term[0].toUpperCase();

    if (this.glossary && term in this.glossary[startLetter]) {
      const glossaryEntry = this.glossary[startLetter][term];
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

  /**
   * Search for terms in the localized glossary.
   */
  async searchLocalizedGlossary(searchText: string, languageCode: string): Promise<GlossarySearchResults> {
    const localizedGlossary = await this.getLocalizedGlossary(languageCode);
    if (!localizedGlossary) {
      console.warn(`No localized glossary found for language code: ${languageCode}`);
      return [];
    }

    const searchLower = searchText.toLowerCase();
    const results: GlossarySearchResults = [];

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
  async searchLocalizedTerms(searchText: string, languageCode: string): Promise<GlossarySearchResults> {
    const localizedGlossary = await this.getLocalizedGlossary(languageCode);
    if (!localizedGlossary) {
      return [];
    }

    const searchLower = searchText.toLowerCase();
    const startsWithResults: GlossarySearchResults = [];
    const includesResults: GlossarySearchResults = [];

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