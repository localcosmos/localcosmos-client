import { ImageLicence } from "../types/Image";


export type LicenceRegistryData = {
  licences: Record<string, ImageLicence>
}
export class LicenceRegistry {

  loaded: boolean = false
  registry: Record<string, ImageLicence> = {}
  
  constructor () {}

  async loadRegistry () {
    if (this.loaded === false) {
      const licenceRegistryPath = '/localcosmos/licence_registry.json';
      const response = await fetch(licenceRegistryPath);
      if (response.ok) {
        const registry = await response.json() as LicenceRegistryData;
        this.registry = registry.licences;
      }
    }

    this.loaded = true;
  }

  getLicence (imageUrl: string): ImageLicence | null {
    if (imageUrl in this.registry) {
      return this.registry[imageUrl];
    }
    return null;
  }
}