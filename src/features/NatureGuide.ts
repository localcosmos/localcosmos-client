import { DetailFeature } from "../Features";
import { TaxonReference } from "./TaxonProfile";
import {cloneDeep} from "lodash";

export type MatrixFilterSpaceReference = {
  spaceIdentifier: string,
  encodedSpace: any,
}

export class MatrixFilterSpace {
  public spaceIdentifier: string = '';
  public encodedSpace: any = '';
  public html?: string
  public points?: number = 0;

  constructor(init?: Partial<MatrixFilterSpace>) {
    Object.assign(this, init)
  }
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

export class MatrixFilter {
  public uuid: string = '';
  public name: string = '';
  public description?: string | null = '';

  public weight: number = 1;
  public allowMultipleValues: boolean = false;
  public restrictions: Record<string, MatrixFilterRestriction[]> = {};
  public definition: object = {};

  public space: MatrixFilterSpace[] = [];
  public position: number = 1;

  public type: MatrixFilterType = "TextOnlyFilter";

  constructor(init?: Partial<MatrixFilterType>) {
    Object.assign(this, init)
  }

  addSpace (space: MatrixFilterSpace) {
    if (!this.space.find(s => s.spaceIdentifier === space.spaceIdentifier)) {
      this.space.push(space);
    }
  }
}

export class RangeFilter extends MatrixFilter {
  public encodedSpace: number[] = [];

  /**
   * We clean up the space identifier to only contain the filter uuid
   *
   * @param space
   */
  addSpace (space: MatrixFilterSpace) {
    space.spaceIdentifier = space.spaceIdentifier.split(':')[0];
    super.addSpace(space);
  }

  updateEncodedSpace (event: IdentificationEvents, identificationKey: IdentificationKey, payload: {}): void {
    const { index, encodedSpace } = payload as { index: number, encodedSpace: number[] };
    if (identificationKey.spaces[index].spaceIdentifier !== this.uuid) {
      return;
    }

    // update the internal encoded space and make sure the space becomes selectable
    this.encodedSpace = encodedSpace;
    identificationKey.selectedSpaces[index] = 0;
    this.updateEncodedSpaceMapping(event, identificationKey, index);
  }

  updateEncodedSpaceMapping (_: IdentificationEvents, identificationKey: IdentificationKey, index: number): void {
    if (identificationKey.spaces[index].spaceIdentifier !== this.uuid) {
      return;
    }

    const space = this.space[0];
    let newMapping = (new Array(identificationKey.children.length).fill(1));
    if (this.encodedSpace.length > 0) {
      newMapping = newMapping.map((_, nodeIndex) => {
        const filter = identificationKey.children[nodeIndex].space[space.spaceIdentifier];
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

export class DescriptiveTextAndImagesFilter extends MatrixFilter {}
export class ColorFilter extends MatrixFilter {}
export class NumberFilter extends MatrixFilter {}
export class TextOnlyFilter extends MatrixFilter {}
export class TaxonFilter extends MatrixFilter {}

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

export type ResultAction = {
  feature: 'TaxonProfiles' | 'GenericForm',
  uuid: string,
}

export type NatureGuideOptions = {
  resultAction: ResultAction
}

export class NatureGuide implements DetailFeature {
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
    Object.assign(this, init)
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
    })

    // add filters
    Object.values(filters).forEach((value) => {
      const matrixFilterClass = MatrixFilterClassMap[value.type];
      const filter = new matrixFilterClass(value);

      key.addMatrixFilter(filter);

      value.space.forEach((space: MatrixFilterSpaceReference) => {
        if (!spaces.find(([_, s]) => s.spaceIdentifier === space.spaceIdentifier)) {
          spaces.push([filter, new MatrixFilterSpace({ ...space, points: filter.weight || 0 })]);
        }
      });
    })

    // add spaces
    spaces.forEach(([filter, space]) => {
      filter.addSpace(space);
      key.addSpace(space);
    })

    // initial calculation
    key.computeFilterVisibilityRestrictions();
    key.computePossibleValues();

    return key;
  }
}

export class IdentificationKey {
  public name: string = '';
  public taxon: TaxonReference | null = null;
  public children: IdentificationKeyReference[] = [];
  public childrenCount: number = 0;
  public factSheets: any[] = [];
  public slug: string = '';
  public overviewImage: string = '';
  public matrixFilters: Record<string, MatrixFilter> = {};
  public identificationMode: IdentificationModes = IdentificationModes.fluid;

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
    Object.assign(this, init)
  }

  addChild (child: IdentificationKeyReference) {
    this.children.push(child);
    this.possibleNodes.push(1);
  }

  addMatrixFilter (filter: MatrixFilter) {
    this.matrixFilters[filter.uuid] = filter;
    this.visibleFilters.push(Object.keys(filter.restrictions).length > 0 ? 0 : 1);

    if (filter instanceof MatrixFilterClassMap.RangeFilter) {
      // register listener to update the space node mapping when the encoded space changes
      this.on(IdentificationEvents.beforeSpaceSelected, filter.updateEncodedSpace);
      this.on(IdentificationEvents.spaceInitialized, filter.updateEncodedSpaceMapping);
    }
  }

  addSpace (space: MatrixFilterSpace) {
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
    }))
    this.notifyListeners(IdentificationEvents.spaceInitialized, this.spaces.length - 1);
  }

  /**
   * Make sure this is called after all filters and spaces have been added
   */
  computeFilterVisibilityRestrictions () {
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
  on (event: IdentificationEvents, callback: Function): void {
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
  off (event: IdentificationEvents, callback: Function): void {
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
  notifyListeners (event: IdentificationEvents, ...payload: any[]) {
    (this.listeners[event] || []).forEach((callback) => {
      callback.call(callback, event, this, ...payload);
    });
  }

  computePossibleValues () {
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
      return this.filterVisibilityRestrictions[index].every(r => r.some(v => this.selectedSpaces[v] === 1)) ? 1 : 0;
    });

    this.computeResults();
  }

  computeResults () {
    this.results = this.sortNodes(this.children.filter((_, index) => this.possibleNodes[index] === 1));
    this.impossibleResults = this.sortNodes(this.children.filter((_, index) => this.possibleNodes[index] === 0));
  }

  private sortNodes (nodes: IdentificationKeyReference[]) {
    return nodes.sort((a, b) => {
      return ((this.points[b.uuid] || 0) / b.maxPoints) - ((this.points[a.uuid] || 0) / a.maxPoints);
    });
  }

  /***
   * Select Space:
   * To select a space we flip the value in `selectedSpaces` to 1 and compute the follow-up matrices
   */
  selectSpace (index: number, encodedSpace: any = null) {
    this.notifyListeners(IdentificationEvents.beforeSpaceSelected, { index, encodedSpace });

    if (this.selectedSpaces[index] === 1 || this.possibleSpaces[index] === 0) {
      return;
    }

    this.selectedSpaces[index] = 1;
    this.computePossibleValues();
    this.notifyListeners(IdentificationEvents.spaceSelected, { index, encodedSpace });
  }

  deselectSpace (index: number, encodedSpace: any = null) {
    if (this.selectedSpaces[index] === 0) {
      return;
    }
    this.selectedSpaces[index] = 0;
    this.computePossibleValues();
    this.notifyListeners(IdentificationEvents.spaceDeselected, { index, encodedSpace });
  }

  findSpaceIndex (space: MatrixFilterSpace) {
    return this.spaces.findIndex(s => s.spaceIdentifier === space.spaceIdentifier);
  }

  findFilterIndex (filter: MatrixFilter) {
    return Object.values(this.matrixFilters).findIndex(f => f.uuid === filter.uuid);
  }

  isSpaceSelected (space: MatrixFilterSpace): boolean {
    return this.selectedSpaces[this.findSpaceIndex(space)] === 1;
  }

  isSpacePossible (space: MatrixFilterSpace): boolean {
    return this.possibleSpaces[this.findSpaceIndex(space)] === 1;
  }

  isFilterVisible (filter: MatrixFilter): boolean {
    return this.visibleFilters[this.findFilterIndex(filter)] === 1;
  }
}
