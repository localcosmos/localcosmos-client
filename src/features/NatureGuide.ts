import { FeatureBase } from "../types/Features";
import { TaxonType } from "./BackboneTaxonomy";
import { ImageUrls, ImageLicence } from "../types/Image";
// this should be replaced with something independant
import { cloneDeep } from "lodash";

export type MatrixFilterSpaceReference = {
  spaceIdentifier: string,
  encodedSpace: any,
}

export class MatrixFilterSpace {
  public spaceIdentifier: string = '';
  public encodedSpace: any = '';
  public html?: string;
  public points?: number = 0;

  constructor(init?: Partial<MatrixFilterSpace>) {
    Object.assign(this, init);
  }
}

export type DescriptiveTextAndImagesFilterSpace = MatrixFilterSpace & {
  imageUrl: ImageUrls,
  licence: ImageLicence,
  secondaryImageUrl: ImageUrls,
  secondaryLicence: ImageLicence,
}

export enum ColorTypes {
  single = 'single',
  gradient = 'gradient',
  triplet = 'triplet',
}

export type ColorFilterSpace = MatrixFilterSpace & {
  gradient: boolean,
  colorType: ColorTypes,
  description: string,
}
export type TextOnlyFilterSpace = MatrixFilterSpace
export type TaxonFilterSpace = MatrixFilterSpace

export enum MatrixFilterType {
  DescriptiveTextAndImagesFilter = 'DescriptiveTextAndImagesFilter',
  TextOnlyFilter = 'TextOnlyFilter',
  ColorFilter = 'ColorFilter',
  RangeFilter = 'RangeFilter',
  NumberFilter = 'NumberFilter',
  TaxonFilter = 'TaxonFilter',
}

export enum IdentificationMeans {
  visual = 'visual',
  tactile = 'tactile',
  auditory = 'auditory',
  microscope = 'microscope',
  scalpel = 'scalpel',
  gustatory = 'gustatory',
  olfactory = 'olfactory',
}

export interface MatrixFilterTreeNode {
  taxonNuid: string
}

export interface MatrixFilterMetaNode {
  name: string
}

type MatrixFilterRestriction = {
  spaceIdentifier: string
  encodedSpace: string
}

export type MatrixFilterDefinition = {
  min?: null | number,
  max?: null | number,
  step?: null | number,
  unit?: string,
  unitVerbose?: string,
}

// the defaults of Matrixfilter are just BS
// this should be rewritten
export class MatrixFilter {
  public uuid: string = '';
  public name: string = '';
  // there should not be a default ype
  public type: MatrixFilterType = MatrixFilterType.TextOnlyFilter;
  public description?: string | null = '';

  public weight: number = 1;
  public allowMultipleValues: boolean = false;
  public restrictions: Record<string, MatrixFilterRestriction[]> = {};
  public isRestricted: boolean = false;
  public idenficitationMeans: IdentificationMeans[] = [];
  public definition: MatrixFilterDefinition = {};

  public treeNode: MatrixFilterTreeNode = { 'taxonNuid': '' }
  public metaNode: MatrixFilterMetaNode = { 'name': '' }

  public space: MatrixFilterSpace[] = [];
  public position: number = 1;


  constructor(init?: Partial<MatrixFilterType>) {
    Object.assign(this, init);
  }

  addSpace(space: MatrixFilterSpace) {
    if (!this.space.find(s => s.spaceIdentifier === space.spaceIdentifier)) {
      this.space.push(space);
    }
  }
}

export class RangeFilter extends MatrixFilter {

  public type: MatrixFilterType = MatrixFilterType.RangeFilter;

  public encodedSpace: number[] = [];

  /**
   * Range filters only contain a single filter:
   *
   * @param space
   */
  addSpace(space: MatrixFilterSpace) {
    if (this.space.length >= 1) {
      return;
    }

    space.spaceIdentifier = space.spaceIdentifier.split(':')[0];
    this.space.push(space);
  }

  updateEncodedSpace(event: IdentificationEvents, identificationKey: IdentificationKey, payload: {}): void {
    const { index, encodedSpace } = payload as { index: number, encodedSpace: number[] };
    if (identificationKey.spaces[index].spaceIdentifier.slice(0, 36) !== this.uuid) {
      return;
    }

    // update the internal encoded space and make sure the space becomes selectable
    this.encodedSpace = encodedSpace;
    identificationKey.selectedSpaces[index] = 0;
    this.updateEncodedSpaceMapping(event, identificationKey, index);
  }

  updateEncodedSpaceMapping(_: IdentificationEvents, identificationKey: IdentificationKey, index: number): void {
    if (identificationKey.spaces[index].spaceIdentifier.slice(0, 36) !== this.uuid) {
      return;
    }

    let newMapping = (new Array(identificationKey.children.length).fill(1));
    if (this.encodedSpace.length > 0) {
      newMapping = newMapping.map((_, nodeIndex) => {
        const filter = identificationKey.children[nodeIndex].space[this.uuid];
        if (filter) {
          return filter.find((spaceRef: MatrixFilterSpaceReference) => {
            return (this.encodedSpace[0] >= spaceRef.encodedSpace[0]) &&
              (this.encodedSpace[0] <= spaceRef.encodedSpace[1]);
          })
            ? 1
            : 0;
        }

        return 0;
      });
    }

    identificationKey.spaceNodeMapping[index] = newMapping;
  }
}

export class DescriptiveTextAndImagesFilter extends MatrixFilter {
  public type: MatrixFilterType = MatrixFilterType.DescriptiveTextAndImagesFilter;
}

export class ColorFilter extends MatrixFilter {
  public type: MatrixFilterType = MatrixFilterType.ColorFilter;
}

export class NumberFilter extends MatrixFilter {
  public type: MatrixFilterType = MatrixFilterType.NumberFilter;
}

export class TextOnlyFilter extends MatrixFilter {
  public type: MatrixFilterType = MatrixFilterType.TextOnlyFilter;
}

export class TaxonFilter extends MatrixFilter {
  public type: MatrixFilterType = MatrixFilterType.TaxonFilter;
}

export const MatrixFilterClassMap = {
  DescriptiveTextAndImagesFilter,
  ColorFilter,
  RangeFilter,
  NumberFilter,
  TextOnlyFilter,
  TaxonFilter,
};

export enum IdentificationEvents {
  spaceInitialized = 'spaceInitialized',
  beforeSpaceSelected = 'beforeSpaceSelected',
  spaceSelected = 'spaceSelected',
  spaceDeselected = 'spaceDeselected',
  filterBecameVisible = 'filterBecameVisible',
  filterBecameInvisible = 'filterBecameInvisible',

  /**
   * triggered when all possible choices are made
   */
  identificationKeyDone = 'identificationKeyDone',
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
  imageUrl: ImageUrls,
  licence: ImageLicence,
  space: Record<string, MatrixFilterSpaceReference[]>,
  maxPoints: number
  isVisible: boolean
  name: string
  decisionRule: string
  taxon: TaxonType | null
  templateContents: any[] // todo: missing type info
  slug: string
  description: string | null
  morphotype?: string | null
}

export enum ResultActions {
  TaxonProfiles = 'TaxonProfiles',
  GenericForm = 'GenericForm',
}

export type ResultAction = {
  feature: ResultActions,
  uuid: string,
}

export type NatureGuideOptions = {
  resultAction: ResultAction
}

export class NatureGuide implements FeatureBase {
  public name = '';
  public slug = '';
  public uuid = '';
  public options: NatureGuideOptions | null = null;
  public globalOptions = {};
  public version: number = 1;

  public crossLinks: any = null;
  public isMulticontent: boolean = false;
  public slugs: Record<string, string> = {};
  public startNodeUuid: string = '';

  // the tree in json format. this means any object in here is not instantiated:
  // typing is almost identical to the IdentificationKey type without methods and cross-references
  public tree: Record<string, object> = {};

  constructor(init?: Partial<NatureGuide>) {
    Object.assign(this, init);
  }

  getIdentificationKey(uuid: string): IdentificationKey | null {
    if (!this.tree[uuid]) {
      return null;
    }

    // instantiating an identification key with the json data:
    const json = cloneDeep(this.tree[uuid]);
    const filters = { ...json.matrixFilters };
    const children = [...json.children];

    const key = new IdentificationKey({ ...json, matrixFilters: {}, children: [] });
    const spaces: [MatrixFilter, MatrixFilterSpace][] = [];

    // add children:
    children.forEach((child: IdentificationKeyReference) => {
      key.addChild(child);
    });

    // add filters
    Object.values(filters).forEach((value) => {
      const matrixFilterClass = MatrixFilterClassMap[value.type];
      const filter = new matrixFilterClass(value);

      key.addMatrixFilter(filter);

      value.space.forEach((space: MatrixFilterSpaceReference) => {
        if (
          (
            matrixFilterClass === RangeFilter &&
            !spaces.find(([_, s]) => s.spaceIdentifier.slice(0, 36) === space.spaceIdentifier.slice(0, 36))
          ) ||
          !spaces.find(([_, s]) => s.spaceIdentifier === space.spaceIdentifier)
        ) {
          spaces.push([filter, new MatrixFilterSpace({ ...space, points: filter.weight || 0 })]);
        }
      });
    });

    // add spaces
    spaces.forEach(([filter, space]) => {
      filter.addSpace(space);
      key.addSpace(space);
    });

    // initial calculation
    key.computeFilterVisibilityRestrictions();
    key.computePossibleValues();

    return key;
  }
}

export class IdentificationKey {
  public uuid: string = '';
  public name: string = '';
  public morphotype: string | null = null;
  public taxon: TaxonType | null = null;
  public children: IdentificationKeyReference[] = [];
  public childrenCount: number = 0;
  public templateContents: any[] = [];
  public slug: string = '';
  public overviewImage: ImageUrls| null = null;
  public matrixFilters: Record<string, MatrixFilter> = {};
  public identificationMode: IdentificationModes = IdentificationModes.strict;
  public description: string = '';

  /**
   * A matrix that maps spaces to the nodes that they encode for. E.g. if the space "brown" for the filter "color" is
   * mapping to the nodes 1 and 2 but not node 3, the matrix will look like this (assuming there are 3 nodes in total):
   * [
   *  [1, 1, 0],
   *  // other spaces e.g. "red" come here...
   *  // also other spaces of other filters e.g. "small" for the filter "size"
   * ]
   *
   * Both row and column indices correspond to the order of the spaces and nodes in the respective arrays.
   */
  public spaceNodeMapping: (0 | 1)[][] = [];

  /**
   * A 1 for each selected space, 0 for each deselected space. The index of the array corresponds to the index of the
   * space in the spaces array.
   */
  public selectedSpaces: (0 | 1)[] = [];

  /**
   * List of all Spaces this key has. This is a flat list of all spaces of all filters.
   */
  public spaces: MatrixFilterSpace[] = [];

  /**
   * All nodes are either 1 or 0. 1 means the node is possible, 0 means the node is impossible.
   * The values get updated by the computePossibleValues method.
   */
  public possibleNodes: (0 | 1)[] = [];

  /**
   * All spaces are either 1 or 0. 1 means the space is possible, 0 means the space is impossible.
   * The values get updated by the computePossibleValues method.
   */
  public possibleSpaces: (0 | 1)[] = [];

  /**
   * A two-dimensional array that maps filters to the spaces that they are restricted. E.g.
   * [
   *  // first filter has no restrictions
   *  [],
   *
   *  // the second filter has one restriction.
   *  // It is only visible if the first space is selected
   *  [[0]],
   *
   *  // the third filter has two restrictions. Both spaces restricting this filter are within the same filter,
   *  // so this filter is only visible if the first OR second space is selected
   *  [[0, 1]],
   *
   *  // the fourth filter has two restrictions. It is only visible if the first space is selected AND the
   *  // fourth space is selected. This is because the two restrictions are in different filters.
   *  [[0], [3]],
   * ]
   */
  public filterVisibilityRestrictions: number[][][] = [];

  /**
   * A flat list of filter indices. 1 if the filter is visible, 0 if the filter is not visible.
   */
  public visibleFilters: (0 | 1)[] = [];

  /**
   * List of all child nodes that are currently possible. This is updated by the computeResults method.
   */
  public results: IdentificationKeyReference[] = [];

  /**
   * List of all child nodes that are currently impossible. This is updated by the computeResults method.
   */
  public impossibleResults: IdentificationKeyReference[] = [];

  /**
   * A simple mapping of the uuid of a node to the number of points it has.
   */
  public points: Record<string, number> = {};

  private listeners: Record<string, Function[]> = {};

  constructor(init?: Partial<IdentificationKey>) {
    Object.assign(this, init);

    // make sure we automatically deselect filters which are restricted and become invisible once the "parent" space is deselected
    this.on(
      IdentificationEvents.filterBecameInvisible,
      (event: string, key: IdentificationKey, payload: { index: number, filter: MatrixFilter }) => this.deselectMatrixFilter(payload.filter),
    );
  }

  addChild(child: IdentificationKeyReference) {
    this.children.push(child);
    this.possibleNodes.push(1);
  }

  addMatrixFilter(filter: MatrixFilter) {
    this.matrixFilters[filter.uuid] = filter;
    this.visibleFilters.push(Object.keys(filter.restrictions).length > 0 ? 0 : 1);

    if (filter instanceof MatrixFilterClassMap.RangeFilter) {
      // register listener to update the space node mapping when the encoded space changes
      this.on(IdentificationEvents.beforeSpaceSelected, filter.updateEncodedSpace.bind(filter));
      this.on(IdentificationEvents.spaceInitialized, filter.updateEncodedSpaceMapping.bind(filter));
    }
  }

  addSpace(space: MatrixFilterSpace) {
    if (this.spaces.find(s => s.spaceIdentifier === space.spaceIdentifier)) {
      return;
    }

    this.spaces.push(space);
    this.selectedSpaces.push(0);
    this.possibleSpaces.push(1);
    this.spaceNodeMapping.push((new Array(this.children.length).fill(0)).map((_, nodeIndex) => {
      const splits = space.spaceIdentifier.split(':', 1);
      const filter = this.children[nodeIndex].space[splits[0]];
      if (filter) {
        return filter.find(reference => reference.spaceIdentifier === space.spaceIdentifier) ? 1 : 0;
      }

      return 0;
    }));
    this.notifyListeners(IdentificationEvents.spaceInitialized, this.spaces.length - 1);
  }

  /**
   * Make sure this is called after all filters and spaces have been added
   */
  computeFilterVisibilityRestrictions() {
    this.filterVisibilityRestrictions = Object.values(this.matrixFilters).map((filter) => {
      return Object.values(filter.restrictions).map((restriction: MatrixFilterSpace[]) => {
        return restriction.map((space) => {
          return this.findSpaceIndex(space as MatrixFilterSpace);
        });
      });
    });
  }

  /**
   * Register a callback for an identification event
   *
   * @param event
   * @param callback
   */
  on(event: IdentificationEvents, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Unregister a callback for an event
   *
   * @param event
   * @param callback
   */
  off(event: IdentificationEvents, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(f => f !== callback);
    }
  }

  /**
   * Notifies all registered listeners for a given event.
   *
   * @param event
   * @param payload optional payload for the event
   * @private
   */
  notifyListeners(event: IdentificationEvents, ...payload: any[]) {
    (this.listeners[event] || []).forEach((callback) => {
      callback.call(callback, event, this, ...payload);
    });
  }

  computePossibleValues() {
    this.possibleNodes = this.children.map((_, nodeIndex) => {
      return this.spaces.reduce((a, b, spaceIndex) => {
        return a && (this.spaceNodeMapping[spaceIndex][nodeIndex] === 1 && this.selectedSpaces[spaceIndex] === 1 || this.selectedSpaces[spaceIndex] === 0);
      }, true)
        ? 1
        : 0;
    });
    this.possibleSpaces = this.spaces.map((_, spaceIndex) => {
      return this.selectedSpaces[spaceIndex] === 1 || this.children.reduce((a, b, nodeIndex) => {
        return a || (this.spaceNodeMapping[spaceIndex][nodeIndex] === 1 && this.possibleNodes[nodeIndex] === 1);
      }, false)
        ? 1
        : 0;
    });

    this.points = Object.fromEntries(this.children.map((node, index) => [
      node.uuid,
      this.spaces.reduce((a, b, spaceIndex) => {
        return a + (this.spaceNodeMapping[spaceIndex][index] === 1 && this.selectedSpaces[spaceIndex] === 1 ? this.spaces[spaceIndex].points : 0);
      }, 0),
    ]));

    this.visibleFilters = Object.values(this.matrixFilters).map((filter, index) => {
      const visible = this.filterVisibilityRestrictions[index].every(r => r.some(v => this.selectedSpaces[v] === 1));
      if (visible && 0 === this.visibleFilters[index]) {
        this.notifyListeners(IdentificationEvents.filterBecameVisible, { filter, index });
      } else if (!visible && 1 === this.visibleFilters[index]) {
        this.notifyListeners(IdentificationEvents.filterBecameInvisible, { filter, index });
      }

      return visible ? 1 : 0;
    });

    this.computeResults();
  }

  computeResults() {
    this.results = this.sortNodes(this.children.filter((_, index) => this.possibleNodes[index] === 1));
    this.impossibleResults = this.sortNodes(this.children.filter((_, index) => this.possibleNodes[index] === 0));

    //if (this.results.length === 1 || this.doneFilters.every(v => v)) {
    if (this.doneFilters.every(v => v)) {
      this.notifyListeners(
        IdentificationEvents.identificationKeyDone,
        { resultCount: this.results.length },
      )
    }
  }

  private sortNodes(nodes: IdentificationKeyReference[]) {
    return nodes.sort((a, b) => {
      return ((this.points[b.uuid] || 0) / b.maxPoints) - ((this.points[a.uuid] || 0) / a.maxPoints);
    });
  }

  /**
   * Returns true for each visible filter that either has a selected space or no possible space
   *
   * Use with care, as this is an expensive operation.
   */
  get doneFilters() {
    return Object.values(this.matrixFilters).map((filter, index) => {
      if (this.visibleFilters[index] === 0) {
        return true;
      }

      // for each visible filter, check if it has at least one selected or possible space
      // if not, then it is impossible
      const spaceIndices = filter.space.map((space) => this.findSpaceIndex(space))

      const hasOneSelectedSpace = spaceIndices
        .some((spaceIndex) => this.selectedSpaces[spaceIndex] === 1);
      const hasNoPossibleSpace = spaceIndices
        .every((spaceIndex) => this.possibleSpaces[spaceIndex] === 0);

      return hasOneSelectedSpace || hasNoPossibleSpace;
    }).map(possible => possible ? 1 : 0);
  }

  /***
   * Select Space:
   * To select a space we flip the value in `selectedSpaces` to 1 and compute the follow-up matrices
   */
  selectSpace(index: number, encodedSpace: any = null) {
    this.notifyListeners(IdentificationEvents.beforeSpaceSelected, { index, encodedSpace });

    if (this.selectedSpaces[index] === 1 || this.possibleSpaces[index] === 0) {
      return;
    }

    this.selectedSpaces[index] = 1;
    this.computePossibleValues();
    this.notifyListeners(IdentificationEvents.spaceSelected, { index, encodedSpace });
  }

  deselectSpace(index: number, encodedSpace: any = null) {
    if (this.selectedSpaces[index] === 0) {
      return;
    }
    this.selectedSpaces[index] = 0;
    this.computePossibleValues();
    this.notifyListeners(IdentificationEvents.spaceDeselected, { index, encodedSpace });
  }

  deselectMatrixFilter(filter: MatrixFilter) {
    filter.space.forEach(space => {
      this.deselectSpace(this.findSpaceIndex(space));
    });
  }

  findSpaceIndex(space: MatrixFilterSpace) {
    return this.spaces.findIndex(s => s.spaceIdentifier === space.spaceIdentifier);
  }

  findFilterIndex(filter: MatrixFilter) {
    return Object.values(this.matrixFilters).findIndex(f => f.uuid === filter.uuid);
  }

  isSpaceSelected(space: MatrixFilterSpace): boolean {
    return this.selectedSpaces[this.findSpaceIndex(space)] === 1;
  }

  isSpacePossible(space: MatrixFilterSpace): boolean {
    return this.possibleSpaces[this.findSpaceIndex(space)] === 1;
  }

  isFilterVisible(filter: MatrixFilter): boolean {
    return this.visibleFilters[this.findFilterIndex(filter)] === 1;
  }
}
