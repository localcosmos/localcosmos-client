import {
  IdentificationKey as IdentificationKeyType,
  MatrixFilterSpace as MatrixFilterSpaceType,
  MatrixFilter as MatrixFilterType,
  NatureGuide as NatureGuideType,
  NatureGuideOptions, IdentificationKeyReference, IdentificationEvents, MatrixFilterSpaceReference,
} from "../types/features/NatureGuide";

export class NatureGuide implements NatureGuideType {
  public crossLinks = {};
  public options = {} as NatureGuideOptions;
  public globalOptions = {};
  public isMulticontent = false;
  public name = '';
  public slug = '';
  public slugs = {};
  public startNodeUuid = '';
  public uuid = '';
  public tree = {};
  public version: number = 1;

  constructor(init?: Partial<NatureGuideType>) {
    Object.assign(this, init)
  }

  getIdentificationKey(uuid: string): IdentificationKey | null {
    // @ts-ignore
    if (!this.tree[uuid]) {
      return null;
    }

    // @ts-ignore
    const json = this.tree[uuid] || null;

    // instantiating an identification key with the json data:
    const filters = { ...json.matrixFilters };

    const key = new IdentificationKey(json);
    const spaces: [MatrixFilter, MatrixFilterSpace][] = [];

    // add children:
    json.children.forEach((child: IdentificationKeyReference) => {
      key.addChild(child);
    })

    // add filters
    Object.entries(filters).forEach(([uuid, value]) => {
      // @ts-ignore
      const matrixFilterClass = MatrixFilterClassMap[value.type];
      const filter = new matrixFilterClass(value);

      key.addMatrixFilter(filter);

      // @ts-ignore
      value.space.forEach((space: MatrixFilterSpaceReference) => {
        spaces.push([filter, new MatrixFilterSpace(space)]);
      });
    })

    // add spaces
    spaces.forEach(([filter, space]) => {
      filter.addSpace(space);
      key.addSpace(space);
    })

    // initial calculation
    key.computeFilterVisibilityRestrictions();
    key.computeResults();

    return key;
  }
}

export class IdentificationKey implements IdentificationKeyType {
  public name = '';
  public taxon = null;
  public children: IdentificationKeyReference[] = [];
  public childrenCount = 0;
  public factSheets = [];
  public slug = '';
  public overviewImage = '';
  public matrixFilters: Record<string, MatrixFilter> = {};

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

  // @ts-ignore
  public identificationMode = '';

  constructor(init?: Partial<IdentificationKeyType>) {
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
      // @ts-ignore
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

  findFilterIndex (filter: MatrixFilterType) {
    return Object.values(this.matrixFilters).findIndex(f => f.uuid === filter.uuid);
  }

  isSpaceSelected (space: MatrixFilterSpaceType): boolean {
    return this.selectedSpaces[this.findSpaceIndex(space)] === 1;
  }

  isSpacePossible (space: MatrixFilterSpaceType): boolean {
    return this.possibleSpaces[this.findSpaceIndex(space)] === 1;
  }

  getPointsForSpace (space: MatrixFilterSpaceType): number {
    // todo: reimplement how to get from space to filter here!
    return 0 // this.filter?.weight || 0;
  }

  isFilterVisible (filter: MatrixFilterType): boolean {
    return this.visibleFilters[this.findFilterIndex(filter)] === 1;
  }
}

export class MatrixFilter implements MatrixFilterType {
  public uuid = '';
  public name = '';
  public weight = 1;
  public allowMultipleValues = false;
  public restrictions = {};

  public space: MatrixFilterSpace[] = [];
  public position = 1;

  // @ts-ignore
  public type = 'MatrixFilterType';

  constructor(init?: Partial<MatrixFilterType>) {
    Object.assign(this, init)
  }

  addSpace (space: MatrixFilterSpace) {
    this.space.push(space);
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


export class MatrixFilterSpace implements MatrixFilterSpaceType {
  public spaceIdentifier = '';
  public encodedSpace = '';

  constructor(init?: Partial<MatrixFilterSpaceType>) {
    Object.assign(this, init)
  }
}