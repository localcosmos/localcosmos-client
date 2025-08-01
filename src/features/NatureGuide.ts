import type { ImageUrls } from "../types/Image";
import type { TaxonType } from "./BackboneTaxonomy";
import type { FeatureBase } from "../types/Features";

export type ComponentLink = {
  feature: string,
  uuid: string,
}

export enum NodeType {
  node = 'node',
  result = 'result',
}

export enum IdentificationModes {
  fluid = 'fluid',
  strict = 'strict',
}

export enum ColorTypes {
  single = 'single',
  gradient = 'gradient',
  triplet = 'triplet',
}

export type MatrixFilterRestriction = {
  spaceIdentifier: string
  encodedSpace: string | [number, number]
}

export enum MatrixFilterTypes {
  DescriptiveTextAndImagesFilter = 'DescriptiveTextAndImagesFilter',
  RangeFilter = 'RangeFilter',
  NumberFilter = 'NumberFilter',
  TextOnlyFilter = 'TextOnlyFilter',
  ColorFilter = 'ColorFilter',
  TaxonFilter = 'TaxonFilter',
}

export enum NodeEvents {
  NodeImpossible = 'NodeImpossible',
  NodePossible = 'NodePossible',
  NodePointsChanged = 'NodePointsChanged',
}

export enum SpaceEvents {
  SpaceSelected = 'SpaceSelected',
  SpaceDeselected = 'SpaceDeselected',
  SpacePossible = 'SpacePossible',
  SpaceImpossible = 'SpaceImpossible',
}

export enum MatrixFilterEvents {
  MatrixFilterBecameVisible = 'MatrixFilterBecameVisible',
  MatrixFilterBecameInvisible = 'MatrixFilterBecameInvisible',
}

export enum IdentificationStepEvents {
  IdentificationStepDone = 'IdentificationStepDone',
  IdentificationResultChanged = 'IdentificationResultChanged',
}

export type MatrixFilterSpaceData = {
  spaceIdentifier: string,
}

export type DescriptiveTextAndImagesFilterSpaceData = MatrixFilterSpaceData & {
  encodedSpace: string,
  imageUrl: ImageUrls,
  secondaryImageUrl: ImageUrls,
}

export type RangeFilterSpaceData = MatrixFilterSpaceData & {
  encodedSpace: [number, number],
}

export type NumberFilterSpaceData = MatrixFilterSpaceData & {
  encodedSpace: number,
}

export type TextOnlyFilterSpaceData = MatrixFilterSpaceData & {
  encodedSpace: string,
}

export type TaxonFilterSpaceData = MatrixFilterSpaceData & {
  encodedSpace: string,
  shortName: string,
  latname: string,
  isCustom: boolean,
}

export type ColorFilterSpaceData = MatrixFilterSpaceData & {
  encodedSpace: number[],
  html: string,
  gradient: boolean,
  colorType: ColorTypes,
  desciption: string|null,
}

export type MatrixFilterSpaceDataTypes = DescriptiveTextAndImagesFilterSpaceData | RangeFilterSpaceData | NumberFilterSpaceData | TextOnlyFilterSpaceData | ColorFilterSpaceData | TaxonFilterSpaceData;

export type MatrixFilterData = {
  uuid: string,
  name: string,
  type: MatrixFilterTypes,
  position: number,
  description: string|null,
  weight: number,
  restrictions: Record<string, MatrixFilterRestriction[]>,
  isRestricted: boolean,
  allowMultipleValues: boolean,
  identificationMeans: string|null,
  definition: null | RangeFilterDefinition,
  treeNode: {
    taxonNuid: string,
  },
  metaNode: {
    name: string,
  },
}

export type DescriptiveTextAndImagesFilterData = MatrixFilterData & {
  space: DescriptiveTextAndImagesFilterSpaceData[],
}

export type RangeFilterDefinition = {
  min: number|null,
  max: number|null,
  step: number|null,
  tolerance: number|null,
  unit: string|null,
  unitVerbose: string|null,
}

export type RangeFilterData = MatrixFilterData & {
  space: RangeFilterSpaceData[],
  definition: RangeFilterDefinition,
}

export type NumberFilterDefinition = {
  unit: string,
  unitVerbose:string,
}

export type NumberFilterData = MatrixFilterData & {
  space: NumberFilterSpaceData[],
}

export type TextOnlyFilterData = MatrixFilterData & {
  space: TextOnlyFilterSpaceData[],
}

export type ColorFilterData = MatrixFilterData & {
  space: ColorFilterSpaceData[],
}

export type TaxonFilterData = MatrixFilterData & {
  space: TaxonFilterSpaceData[],
}

export type MatrixFilterDataTypes = DescriptiveTextAndImagesFilterData | RangeFilterData | NumberFilterData | TextOnlyFilterData | ColorFilterData | TaxonFilterData;


export type NodeSpace = {
  spaceIdentifier: string,
  encodedSpace: string,
}

export type NodeColorFilterSpace = {
  spaceIdentifier: string,
  encodedSpace: [number, number, number, number],
}

export type NodeRangeFilterSpace = {
  spaceIdentifier: string,
  encodedSpace: [number, number],
}

export type NodeSpaces = NodeSpace | NodeColorFilterSpace | NodeRangeFilterSpace;

export type NodeData = {
  uuid: string,
  nodeType: NodeType,
  imageUrl: ImageUrls,
  space: Record<string, NodeSpaces[]>,
  name: string,
  morphotype: string | null,
  maxPoints: number,
  taxon: TaxonType,
  slug: string,
  description: string | null,
}

export type IdentificationStepData = {
  uuid: string,
  name: string,
  morphotype: string | null,
  taxon: TaxonType
  children: NodeData[],
  matrixFilters: Record<string, MatrixFilterDataTypes>,
  identificationMode: IdentificationModes,
  slug: string,
  overviewImage: ImageUrls|null,
  description: string|null,
  childrenCount: number,
}

export type NatureGuideComponent = FeatureBase & {
  options: {
    resultAction: ComponentLink,
    version?:string,
  },

  tree: Record<string, IdentificationStepData>,
  startNodeUuid: string,
  slugs: Record<string, string>,
  imageUrl: ImageUrls,
}

/**
 * usable classes
 */

class EventEmitter {
  private listeners: Record<string, Function[]> = {};

  /**
   * Register an event listener.
   */
  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Remove an event listener.
   */
  off(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((f) => f !== callback);
    }
  }

  /**
   * Emit an event and call all registered listeners.
   */
  emit(event: string, payload: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(payload));
    }
  }
}

/**
 * Nodes
 * - If a node becomes impossible, it should notify all matching spaces
 */
export class Node extends EventEmitter {

  data: NodeData;

  identificationStep: IdentificationStep; // Reference to the IdentificationStep this node belongs to

  uuid: string = '';
  name: string = '';
  slug: string = '';
  isPossible: boolean = true;
  points: number = 0;

  private matchingSpaces: Set<MatrixFilterSpaces> = new Set(); // Spaces this node belongs to
  private mismatchingSpaces: Set<MatrixFilterSpaces> = new Set(); // Spaces this node does not belong to

  private selectedMatchingSpaces: Record<string, Set<string>> = {}; // Spaces that are selected for this node
  private selectedMismatchingSpaces: Record<string, Set<string>> = {}; // Spaces that are selected for this node but do not match

  constructor (data: NodeData, identificationStep: IdentificationStep) {
    super();
    this.identificationStep = identificationStep;
    this.uuid = data.uuid;
    this.name = data.name;
    this.slug = data.slug;
    this.data = data;
  }

  addMismatch(matrixFilterUuid: string, spaceIdentifier: string) {

    if (!this.selectedMismatchingSpaces[matrixFilterUuid]) {
      this.selectedMismatchingSpaces[matrixFilterUuid] = new Set();
    }

    // add only if not yet added
    if (this.selectedMismatchingSpaces[matrixFilterUuid].has(spaceIdentifier)) {
      return; // Already added, no need to add again
    }

    this.selectedMismatchingSpaces[matrixFilterUuid].add(spaceIdentifier); // Add spaceIdentifier to the record

    if (Object.keys(this.selectedMismatchingSpaces).length >= 0) {
      this.makeImpossible();
    }
  }

  removeMismatch(matrixFilterUuid: string, spaceIdentifier: string) {

    if (this.selectedMismatchingSpaces[matrixFilterUuid]) {

      // only delete if it exists
      if (!this.selectedMismatchingSpaces[matrixFilterUuid].has(spaceIdentifier)) {
        return; // SpaceIdentifier not found, no need to remove
      }

      this.selectedMismatchingSpaces[matrixFilterUuid].delete(spaceIdentifier); // Remove spaceIdentifier from the record

      // Clean up empty sets
      if (this.selectedMismatchingSpaces[matrixFilterUuid].size === 0) {
        delete this.selectedMismatchingSpaces[matrixFilterUuid];
      }
    }

    if (Object.keys(this.selectedMismatchingSpaces).length === 0) {
      this.makePossible();
    }
  }

  addMatch(matrixFilterUuid: string, spaceIdentifier: string) {
    if (!this.selectedMatchingSpaces[matrixFilterUuid]) {
      this.selectedMatchingSpaces[matrixFilterUuid] = new Set();
    }

    // add only if not yet added
    if (this.selectedMatchingSpaces[matrixFilterUuid].has(spaceIdentifier)) {
      return; // Already added, no need to add again
    }
    this.addPoints(1); // Add points for matching space
    this.selectedMatchingSpaces[matrixFilterUuid].add(spaceIdentifier); // Add spaceIdentifier to the record
  }

  removeMatch(matrixFilterUuid: string, spaceIdentifier: string) {
    if (this.selectedMatchingSpaces[matrixFilterUuid]) {

      // only delete if it exists
      if (!this.selectedMatchingSpaces[matrixFilterUuid].has(spaceIdentifier)) {
        return; // SpaceIdentifier not found, no need to remove
      }
      this.removePoints(1); // Remove points for matching space
      this.selectedMatchingSpaces[matrixFilterUuid].delete(spaceIdentifier); // Remove spaceIdentifier from the record

      // Clean up empty sets
      if (this.selectedMatchingSpaces[matrixFilterUuid].size === 0) {
        delete this.selectedMatchingSpaces[matrixFilterUuid];
      }
    }
  }

  makePossible() {
    this.isPossible = true;

    setTimeout(() => {
      this.notifyMatchingSpacesOfPossibility();
      this.emit(NodeEvents.NodePossible, this);
    }, 0);
  }

  makeImpossible() {
    this.isPossible = false;

    setTimeout(() => {
      this.notifyMatchingSpacesOfImpossibility();
      this.emit(NodeEvents.NodeImpossible, this);
    }, 0);
  }

  private addPoints(points: number) {
    const oldPoints = this.points;
    this.points += points;
    this.emit(NodeEvents.NodePointsChanged, {
      points: this.points,
    });

    this.identificationStep.onNodePointsChanged(this, oldPoints);
  }

  private removePoints(points: number) {
    if (this.points <= 0) {
      return;
    }

    const oldPoints = this.points;

    this.points -= points;

    this.emit(NodeEvents.NodePointsChanged, {
      points: this.points,
    });

    this.identificationStep.onNodePointsChanged(this, oldPoints);
  }

  registerMatchingSpace(space: MatrixFilterSpaces) {
    this.matchingSpaces.add(space);
  }

  registerMismatchingSpace(space: MatrixFilterSpaces) {
    this.mismatchingSpaces.add(space);
  }

  notifyMatchingSpacesOfImpossibility() {
    this.matchingSpaces.forEach((space) => {
      space.matchingNodeBecameImpossible(this);
    });
  }

  notifyMatchingSpacesOfPossibility() {
    this.matchingSpaces.forEach((space) => {
      space.matchingNodeBecamePossible(this);
    });
  }
}

/**
 * Matrix Filters
 */

class MatrixFilter extends EventEmitter {

  uuid: string = '';

  identificationStep: IdentificationStep;

  public isVisible: boolean = true;
  private allowMultipleValues: boolean = false; // if true, multiple values can be selected in the UI

  spaces: MatrixFilterSpaces[] = [];
  selectedSpaces: Set<string> = new Set();

  activeRestrictiveSpaces: Set<MatrixFilterSpace> = new Set(); // spaces that restrict this matrix filter

  constructor (identificationStep: IdentificationStep, uuid: string, isVisibile: boolean, allowMultipleValues: boolean) {
    super();
    this.identificationStep = identificationStep;
    this.uuid = uuid;
    this.isVisible = isVisibile;
    this.allowMultipleValues = allowMultipleValues;
  }

  registerSpace(space: MatrixFilterSpaces) {
    this.spaces.push(space);
  };

  onSelectSpace(spaceIdentifier: string) {
    this.selectedSpaces.add(spaceIdentifier);

    // make all other spaces impossible
    this.spaces.forEach((space) => {
      if (space.spaceIdentifier !== spaceIdentifier && this.allowMultipleValues === false) {
        // if allowMultipleValues is false, all other spaces become impossible
        space.makeImpossible()
      }
    });
  }

  /**
   * making the space possible has to respect if the current possible nodes allow this
   * this is stored on the space itself
   */
  onDeselectSpace(spaceIdentifier: string) {
    if (this.selectedSpaces.has(spaceIdentifier)) {
      this.selectedSpaces.delete(spaceIdentifier);

      this.spaces.forEach((space) => {
        space.onMatrixFilterNoSelection();
      });
    }
  }

  addRestrictiveSpace(restriction: MatrixFilterSpace) {
    if (this.activeRestrictiveSpaces.size === 0) {
      this.makeInvisile();
    }
    this.activeRestrictiveSpaces.add(restriction);
  }

  removeRestrictiveSpace(restriction: MatrixFilterSpace) {
    if (!this.activeRestrictiveSpaces.has(restriction)) {
      console.warn(`Trying to remove a restrictive space that is not registered: ${restriction.spaceIdentifier}`);
      return;
    }
    this.activeRestrictiveSpaces.delete(restriction);
    if (this.activeRestrictiveSpaces.size === 0) {
      this.makeVisible();
    }
  }

  makeVisible() {
    this.isVisible = true;
    this.emit(MatrixFilterEvents.MatrixFilterBecameVisible, this);
  }

  /**
   * If a Matrix Filter becomes invisible, its selected spaces are deselected
   */
  makeInvisile() {
    this.isVisible = false;
    this.spaces.forEach((space) => {
      space.deselect();
    });
    this.emit(MatrixFilterEvents.MatrixFilterBecameInvisible, this);
  }

}

export class DescriptiveTextAndImagesFilter extends MatrixFilter {

  data: DescriptiveTextAndImagesFilterData;
  spaces: DescriptiveTextAndImagesFilterSpace[] = [];

  constructor (identificationStep: IdentificationStep, data: DescriptiveTextAndImagesFilterData) {
    super(identificationStep, data.uuid, !data.isRestricted, data.allowMultipleValues);
    this.data = data;
  }
}

export class RangeFilter extends MatrixFilter {
  
  data: RangeFilterData;
  spaces: RangeFilterSpace[] = [];

  constructor (identificationStep: IdentificationStep, data: RangeFilterData) {
    super(identificationStep, data.uuid, !data.isRestricted, data.allowMultipleValues);
    this.data = data;
  }
}

export class NumberFilter extends MatrixFilter {
  data: NumberFilterData;
  spaces: NumberFilterSpace[] = [];

  constructor (identificationStep: IdentificationStep, data: NumberFilterData) {
    super(identificationStep, data.uuid, !data.isRestricted, data.allowMultipleValues);
    this.data = data;
  }
}

export class TextOnlyFilter extends MatrixFilter {
  data: TextOnlyFilterData;
  spaces: TextOnlyFilterSpace[] = [];

  constructor (identificationStep: IdentificationStep, data: TextOnlyFilterData) {
    super(identificationStep, data.uuid, !data.isRestricted, data.allowMultipleValues);
    this.data = data;
  }
}

export class ColorFilter extends MatrixFilter {
  data: ColorFilterData;
  spaces: ColorFilterSpace[] = [];

  constructor (identificationStep: IdentificationStep, data: ColorFilterData) {
    super(identificationStep, data.uuid, !data.isRestricted, data.allowMultipleValues);
    this.data = data;
  }
}

export class TaxonFilter extends MatrixFilter {
  data: MatrixFilterData;
  spaces: TaxonFilterSpace[] = [];

  constructor (identificationStep: IdentificationStep, data: MatrixFilterData) {
    super(identificationStep, data.uuid, !data.isRestricted, data.allowMultipleValues);
    this.data = data;
  }
}


type MatrixFilters = DescriptiveTextAndImagesFilter | RangeFilter | NumberFilter | TextOnlyFilter | ColorFilter | TaxonFilter;

/**
 * Spaces 
 */

class MatrixFilterSpace extends EventEmitter {

  spaceIdentifier: string = ''; // set by subclasses
  matrixFilter: MatrixFilters;

  matchingNodes: Set<Node> = new Set(); // Use Set instead of Array
  mismatchingNodes: Set<Node> = new Set(); // Use Set instead of Array

  restrictsMatrixFilters: Set<MatrixFilters> = new Set(); // Use Set for restricted matrix filters

  impossibleMatchingNodes: Set<Node> = new Set(); // Use Set for impossible nodes

  isSelected: boolean = false;
  isPossible: boolean = true;

  constructor(spaceIdentifier: string, matrixFilter: MatrixFilters) {
    super();
    this.spaceIdentifier = spaceIdentifier;
    this.matrixFilter = matrixFilter;
  }

  /**
   * Add a node to the matchingNodes set.
   */
  registerMatchingNode(node: Node) {
    this.matchingNodes.add(node);
  }

  /**
   * Add a node to the mismatchingNodes set.
   */
  registerMismatchingNode(node: Node) {
    this.mismatchingNodes.add(node);
  }

  /**
   * Remove a node from the matchingNodes set.
   */
  unregisterMatchingNode(node: Node) {
    this.matchingNodes.delete(node);
  }

  /**
   * Remove a node from the mismatchingNodes set.
   */
  unregisterMismatchingNode(node: Node) {
    this.mismatchingNodes.delete(node);
  }

  /**
   * Add a node to the impossibleMatchingNodes set.
   */
  registerImpossibleMatchingNode(node: Node) {
    this.impossibleMatchingNodes.add(node);
  }

  /**
   * Remove a node from the impossibleMatchingNodes set.
   */
  unregisterImpossibleMatchingNode(node: Node) {
    this.impossibleMatchingNodes.delete(node);
  }

  select(): void {
    this.isSelected = true; // Update the UI immediately

    // Perform background computations asynchronously
    setTimeout(() => {
      this.emit(SpaceEvents.SpaceSelected, this);

      this.matchingNodes.forEach((node) => {
        node.addMatch(this.matrixFilter.uuid, this.spaceIdentifier);
      });

      this.mismatchingNodes.forEach((node) => {
        node.addMismatch(this.matrixFilter.uuid, this.spaceIdentifier);
      });

      this.matrixFilter.onSelectSpace(this.spaceIdentifier);

      this.restrictsMatrixFilters.forEach((matrixFilter) => {
        matrixFilter.removeRestrictiveSpace(this);
      });
    }, 0); // Perform computations in the next tick
  }

  deselect() {
    this.isSelected = false;

    setTimeout(() => {

      this.emit(SpaceEvents.SpaceDeselected, this);

      this.matchingNodes.forEach((node) => {
        node.removeMatch(this.matrixFilter.uuid, this.spaceIdentifier);
      });

      this.mismatchingNodes.forEach((node) => {
        node.removeMismatch(this.matrixFilter.uuid, this.spaceIdentifier);
      });

      this.matrixFilter.onDeselectSpace(this.spaceIdentifier);

      // remove restriction from restricted MatrixFilter
      this.restrictsMatrixFilters.forEach((matrixFilter) => {
        matrixFilter.addRestrictiveSpace(this);
      });
    }, 0);
  }

  /**
   * make the space possible again if the impossibleMatchingNodes allow it
   * this is called when the matrix filter has no selection anymore
   */
  onMatrixFilterNoSelection () {
    if (this.impossibleMatchingNodes.size < this.matchingNodes.size) {
      // there are mathcing nodes for this space
      this.makePossible();
    }
  }

  makePossible() {
    if (!this.isPossible) {
      this.isPossible = true;
      this.emit(SpaceEvents.SpacePossible, this.spaceIdentifier);
    }
  }

  makeImpossible() {
    if (this.isPossible) {
      this.isPossible = false;
      this.emit(SpaceEvents.SpaceImpossible, this.spaceIdentifier);
    }
  }

  /**
   * node management
   */

  matchingNodeBecameImpossible(node: Node): void {
    this.impossibleMatchingNodes.add(node);
    // compare impossibleMatchingNodes with matchingNodes
    if (this.impossibleMatchingNodes.size === this.matchingNodes.size) {
      this.makeImpossible();
    }
  }

  matchingNodeBecamePossible(node: Node): void {
    this.impossibleMatchingNodes.delete(node);
    if (this.impossibleMatchingNodes.size < this.matchingNodes.size) {
      this.makePossible();
    }
  }

  /**
   * Restrictive spaces management
   */

  registerRestrictedMatrixFilter(matrixFilter: MatrixFilters): void {
    this.restrictsMatrixFilters.add(matrixFilter);
  }
}

export class DescriptiveTextAndImagesFilterSpace extends MatrixFilterSpace {
  matrixFilter: DescriptiveTextAndImagesFilter;
  data: DescriptiveTextAndImagesFilterSpaceData;

  constructor (matrixFilter: DescriptiveTextAndImagesFilter, data: DescriptiveTextAndImagesFilterSpaceData) {
    const spaceIdentifier = data.spaceIdentifier;
    super(spaceIdentifier, matrixFilter);
    this.data = data;
    this.matrixFilter = matrixFilter;
  }
}

export class RangeFilterSpace extends MatrixFilterSpace {
  matrixFilter: RangeFilter;
  data: RangeFilterSpaceData;

  constructor (matrixFilter: RangeFilter, data: RangeFilterSpaceData) {
    const spaceIdentifier = data.spaceIdentifier;
    super(spaceIdentifier, matrixFilter);
    this.data = data;
    this.matrixFilter = matrixFilter;
  }

  select (): void {
    throw new Error('RangeFilterSpace does not support selection. Use selectNumber() instead.');
  }

  selectNumber(value: number) {

    this.matrixFilter.identificationStep.nodes.forEach((node) => {

      // Check if the node has data for this space
      if (!node.data.space || !node.data.space[this.matrixFilter.uuid]) {
        // If no data for this space, skip the node
        // console.warn(`Node ${node.uuid} has no data for matrix filter ${this.matrixFilter.uuid} and space ${this.spaceIdentifier}`);
        node.addMismatch(this.matrixFilter.uuid, this.spaceIdentifier);
        node.removeMatch(this.matrixFilter.uuid, this.spaceIdentifier);
        return;
      }

      const nodeSpaceData = node.data.space[this.matrixFilter.uuid] as NodeRangeFilterSpace[];
      // If nodeSpaceData is not an array or is empty, skip the node
      if (!Array.isArray(nodeSpaceData) || nodeSpaceData.length === 0) {
        // console.warn(`Node ${node.uuid} has no valid data for matrix filter ${this.matrixFilter.uuid} and space ${this.spaceIdentifier}`);
        node.addMismatch(this.matrixFilter.uuid, this.spaceIdentifier);
        node.removeMatch(this.matrixFilter.uuid, this.spaceIdentifier);
        return;
      }

      // Check if the nodeSpaceData is valid and has the expected structure

      if (nodeSpaceData && nodeSpaceData.length > 0) {
        // currently, only one range is supported per range filter
        const [nodeMin, nodeMax] = nodeSpaceData[0].encodedSpace;

        let adjustedMin = nodeMin;
        let adjustedMax = nodeMax;

        if (this.matrixFilter.data.definition.tolerance) {
          const tolerance = this.matrixFilter.data.definition.tolerance;
          // Apply tolerance to the nodeMin and nodeMax
          adjustedMax = adjustedMax + (adjustedMax * ( tolerance / 100));
          adjustedMin = adjustedMin - (adjustedMin * ( tolerance / 100));
        }

        if (value >= adjustedMin && value <= adjustedMax) {
          node.removeMismatch(this.matrixFilter.uuid, this.spaceIdentifier);
          node.addMatch(this.matrixFilter.uuid, this.spaceIdentifier);
        } else {
          // add mismatch
          node.addMismatch(this.matrixFilter.uuid, this.spaceIdentifier);
          node.removeMatch(this.matrixFilter.uuid, this.spaceIdentifier);
        }
      }
    });

    this.restrictsMatrixFilters.forEach((matrixFilter) => {
      const restrictionRange = this.getRestrictionRange(matrixFilter);
      //console.log(`RangeFilterSpace: Checking restriction for matrix filter ${matrixFilter.uuid} with space ${this.spaceIdentifier}`);
      //console.log(`RangeFilterSpace: Restriction range is ${restrictionRange}`);
      if (restrictionRange) {
        const [restrictionMin, restrictionMax] = restrictionRange;
        if (value >= restrictionMin && value <= restrictionMax) {
          //console.log(`RangeFilterSpace: Value ${value} is within the restriction range [${restrictionMin}, ${restrictionMax}] for matrix filter ${matrixFilter.uuid}`);
          matrixFilter.removeRestrictiveSpace(this);
        } else {
          matrixFilter.addRestrictiveSpace(this);
        }
      }
      
    });
  }

  getRestrictionRange (restrictedMatrixFilter: MatrixFilters): [number, number] | null{
    const restrictionSpace = restrictedMatrixFilter.data.restrictions[this.matrixFilter.uuid]?.[0];
    if (restrictionSpace) {
      const restrictionRange = restrictionSpace.encodedSpace as [number, number];
      return restrictionRange;
    }
    else {
      console.warn(`RangeFilterSpace: No restriction found for matrix filter ${restrictedMatrixFilter.uuid} and space ${this.spaceIdentifier}`);
    }

    return null;
  }

  deselect(): void {
    this.deselectNumber();
  }

  deselectNumber() {
    this.matrixFilter.identificationStep.nodes.forEach((node) => {
      node.removeMatch(this.matrixFilter.uuid, this.spaceIdentifier);
      node.removeMismatch(this.matrixFilter.uuid, this.spaceIdentifier);
    });

    this.restrictsMatrixFilters.forEach((matrixFilter) => {
      matrixFilter.addRestrictiveSpace(this);
    });
  }
}

export class NumberFilterSpace extends MatrixFilterSpace {
  matrixFilter: NumberFilter;
  data: NumberFilterSpaceData;

  constructor (matrixFilter: NumberFilter, data: NumberFilterSpaceData) {
    const spaceIdentifier = data.spaceIdentifier;
    super(spaceIdentifier, matrixFilter);
    this.data = data;
    this.matrixFilter = matrixFilter;
  }
}

export class TextOnlyFilterSpace extends MatrixFilterSpace {
  matrixFilter: TextOnlyFilter;
  data: TextOnlyFilterSpaceData;

  constructor (matrixFilter: TextOnlyFilter, data: TextOnlyFilterSpaceData) {
    const spaceIdentifier = data.spaceIdentifier;
    super(spaceIdentifier, matrixFilter);
    this.data = data;
    this.matrixFilter = matrixFilter;
  }
}

export class ColorFilterSpace extends MatrixFilterSpace {
  matrixFilter: ColorFilter;
  data: ColorFilterSpaceData;

  constructor (matrixFilter: ColorFilter, data: ColorFilterSpaceData) {
    const spaceIdentifier = data.spaceIdentifier;
    super(spaceIdentifier, matrixFilter);
    this.data = data;
    this.matrixFilter = matrixFilter;
  }
}

export class TaxonFilterSpace extends MatrixFilterSpace {
  matrixFilter: TaxonFilter;
  data: TaxonFilterSpaceData;

  constructor (matrixFilter: TaxonFilter, data: TaxonFilterSpaceData) {
    const spaceIdentifier = data.spaceIdentifier;
    super(spaceIdentifier, matrixFilter);
    this.data = data;
    this.matrixFilter = matrixFilter;
  }
}

type MatrixFilterSpaces = DescriptiveTextAndImagesFilterSpace | RangeFilterSpace | NumberFilterSpace | TextOnlyFilterSpace | ColorFilterSpace | TaxonFilterSpace;

/**
 * Identification Step
 */

export class IdentificationStep extends EventEmitter {

  uuid: string;
  slug: string;
  name: string;
  nodes: Node[];
  matrixFilters: Record<string, MatrixFilters> = {}; // Use a Record for matrixFilters
  spaces: Record<string, MatrixFilterSpaces> = {}; // Use a Record for spaces
  currentResult: Node|null = null;

  private pointsToNodes: Record<number, Set<Node>> = {};
  private maxPoints: number | null = null;

  constructor(data: IdentificationStepData) {

    // console.log('Creating IdentificationStep with data:', data);
    super();
    this.uuid = data.uuid;
    this.slug = data.slug;
    this.name = data.name;

    // Populate matrixFilters and spaces as Records
    for (const [matrixfilterUuid, filterData] of Object.entries(data.matrixFilters)) {
      switch (filterData.type) {
        case MatrixFilterTypes.DescriptiveTextAndImagesFilter: {
          const dtaiFilter = new DescriptiveTextAndImagesFilter(this, filterData as DescriptiveTextAndImagesFilterData);
          this.matrixFilters[filterData.uuid] = dtaiFilter;
          filterData.space.forEach((spaceData) => {
            const dtaiFilterSpace = new DescriptiveTextAndImagesFilterSpace(dtaiFilter, spaceData as DescriptiveTextAndImagesFilterSpaceData);
            this.spaces[spaceData.spaceIdentifier] = dtaiFilterSpace;
            dtaiFilter.registerSpace(dtaiFilterSpace);
          });
          break;
        }
        case MatrixFilterTypes.RangeFilter: {
          const rangeFilter = new RangeFilter(this, filterData as RangeFilterData);
          this.matrixFilters[filterData.uuid] = rangeFilter;
          // currently, only one range is supported per range filter
          const rangeFilterSpaceata = filterData.space[0] as RangeFilterSpaceData;
          const rangeFilterSpace = new RangeFilterSpace(rangeFilter, rangeFilterSpaceata);
          this.spaces[rangeFilterSpace.spaceIdentifier] = rangeFilterSpace;
          rangeFilter.registerSpace(rangeFilterSpace);
          break;
        }
        case MatrixFilterTypes.NumberFilter: {
          const numberFilter = new NumberFilter(this, filterData as NumberFilterData);
          this.matrixFilters[filterData.uuid] = numberFilter;
          filterData.space.forEach((spaceData) => {
            const numberFilterSpace = new NumberFilterSpace(numberFilter, spaceData as NumberFilterSpaceData);
            this.spaces[spaceData.spaceIdentifier] = numberFilterSpace;
            numberFilter.registerSpace(numberFilterSpace);
          });
          break;
        }
        case MatrixFilterTypes.TextOnlyFilter: {
          const textOnlyFilter = new TextOnlyFilter(this, filterData as TextOnlyFilterData);
          this.matrixFilters[filterData.uuid] = textOnlyFilter;
          filterData.space.forEach((spaceData) => {
            const textOnlyFilterSpace = new TextOnlyFilterSpace(textOnlyFilter, spaceData as TextOnlyFilterSpaceData);
            this.spaces[spaceData.spaceIdentifier] = textOnlyFilterSpace;
            textOnlyFilter.registerSpace(textOnlyFilterSpace);
          });
          break;
        }
        case MatrixFilterTypes.ColorFilter: {
          const colorFilter = new ColorFilter(this, filterData as ColorFilterData);
          this.matrixFilters[filterData.uuid] = colorFilter;
          filterData.space.forEach((spaceData) => {
            const colorFilterSpace = new ColorFilterSpace(colorFilter, spaceData as ColorFilterSpaceData);
            this.spaces[spaceData.spaceIdentifier] = colorFilterSpace;
            colorFilter.registerSpace(colorFilterSpace);
          });
          break;
        }
        case MatrixFilterTypes.TaxonFilter: {
          const taxonFilter = new TaxonFilter(this, filterData as TaxonFilterData);
          this.matrixFilters[filterData.uuid] = taxonFilter;
          filterData.space.forEach((spaceData) => {
            const taxonFilterSpace = new TaxonFilterSpace(taxonFilter, spaceData as TaxonFilterSpaceData);
            this.spaces[spaceData.spaceIdentifier] = taxonFilterSpace;
            taxonFilter.registerSpace(taxonFilterSpace);
          }
          );
          break;
        }
      }
    }

    // iterate over all matrixFilters and register restrictions
    for (const [matrixfilterUuid, filterData] of Object.entries(data.matrixFilters)) {
      if (filterData.isRestricted) {
        const restrictedMatrixFilter = this.matrixFilters[matrixfilterUuid];
        // iterate over Record<string, MatrixFilterRestriction[]> restrictions
        for (const [restrictiveMatrixFilterUuid, restrictions] of Object.entries(filterData.restrictions)) {

          const restrictiveMatrixFilter = this.matrixFilters[restrictiveMatrixFilterUuid];

          if (restrictiveMatrixFilter.data.type === MatrixFilterTypes.RangeFilter) {
            const rangeFilter = restrictiveMatrixFilter as RangeFilter;
            const restriction = restrictions[0]; // currently, only one restriction is supported per range filter
            const rangeFilterSpace = rangeFilter.spaces[0];
            rangeFilterSpace.registerRestrictedMatrixFilter(restrictedMatrixFilter);
            restrictedMatrixFilter.addRestrictiveSpace(rangeFilterSpace);
          }
          else {
            restrictions.forEach((restriction) => {
              // Find the space in this.spaces that matches the spaceIdentifier
              let spaceIdentifier = restriction.spaceIdentifier;
              const space = this.spaces[spaceIdentifier];
              if (space) {
                // Register the restriction on the matrix filter
                space.registerRestrictedMatrixFilter(restrictedMatrixFilter);
                // Add the restriction to the activeRestrictiveSpaces of the matrix filter
                restrictedMatrixFilter.addRestrictiveSpace(space);
              } else {
                console.warn(`Space with identifier ${spaceIdentifier} not found for restriction.`);
              }
            });
          }
        }
      }
    }

    // Populate nodes and link them to spaces, bi-directionally
    this.nodes = data.children.map((child) => {

      const node = new Node(child, this);

      // Track which spaces this node matches
      const matchingSpaceIdentifiers = Object.values(child.space)
        .flat() // Flatten the array of arrays into a single array of NodeSpace objects
        .map((spaceData) => spaceData.spaceIdentifier); // Extract spaceIdentifier from each NodeSpace


      // Iterate over all spaces in IdentificationStep
      Object.values(this.spaces).forEach((spaceInstance) => {
        if (matchingSpaceIdentifiers.includes(spaceInstance.spaceIdentifier)) {
          // Node matches this space
          spaceInstance.registerMatchingNode(node);
          node.registerMatchingSpace(spaceInstance);
        } else {
          // Node mismatches this space
          // console.log(`Node ${node.data.name} does not match space ${spaceInstance.spaceIdentifier}`);
          spaceInstance.registerMismatchingNode(node);
          node.registerMismatchingSpace(spaceInstance);
        }
      });

      return node;
    });
  }

  // receiver for node points changed
  onNodePointsChanged(node: Node, oldPoints: number): void {
    // Remove the node from its old points group
    if (oldPoints > 0 && this.pointsToNodes[oldPoints]) {
      this.pointsToNodes[oldPoints].delete(node);
      if (this.pointsToNodes[oldPoints].size === 0) {
        delete this.pointsToNodes[oldPoints];
        if (this.maxPoints === oldPoints) {
          this.maxPoints = Math.max(...Object.keys(this.pointsToNodes).map(Number)) || null;
        }
      }
    }
  
    // Add the node to its new points group if points > 0
    if (node.isPossible && node.points > 0) {
      if (!this.pointsToNodes[node.points]) {
        this.pointsToNodes[node.points] = new Set();
      }
      this.pointsToNodes[node.points].add(node);
  
      // Update maxPoints
      if (this.maxPoints === null || node.points > this.maxPoints) {
        this.maxPoints = node.points;
      }
    }
  
    // Update currentResult
    let newResult: Node | null = null;
    if (this.maxPoints !== null && this.maxPoints > 0) {
      const nodesWithMaxPoints = Array.from(this.pointsToNodes[this.maxPoints]);
      newResult = nodesWithMaxPoints.length > 0 ? nodesWithMaxPoints[0] : null;
    } else {
      newResult = null;
    }
  
    // Emit event if currentResult changes or if it becomes null
    if (newResult !== this.currentResult || (newResult === null && this.currentResult !== null)) {
      this.currentResult = newResult;
      this.emit(IdentificationStepEvents.IdentificationResultChanged, this.currentResult);
    }
  }

  /**
   * Helper methods
   */
  selectSpace(spaceIdentifier: string): void {
    if (this.spaces[spaceIdentifier]) {
      this.spaces[spaceIdentifier].select();
    } else {
      console.warn(`Space with identifier ${spaceIdentifier} not found.`);
    }
  }

  deselectSpace(spaceIdentifier: string): void {
    if (this.spaces[spaceIdentifier]) {
      this.spaces[spaceIdentifier].deselect();
    } else {
      console.warn(`Space with identifier ${spaceIdentifier} not found.`);
    }
  }
}