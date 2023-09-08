export class Taxon {

  constructor(
    public taxonSource: string,
    public taxonLatname: string,
    public taxonAuthor: string,
    public nameUuid: string,
    public taxonNuid: string) { }
}