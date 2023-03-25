import { beforeEach, describe, expect, vi, test } from 'vitest';
import {
  IdentificationKey,
  IdentificationEvents,
  IdentificationModes,
  NatureGuide,
  MatrixFilterSpace
} from "../src/features/NatureGuide";
import NatureGuideFixture from './fixtures/NatureGuide.json';

describe('IdentificationKey', () => {
  let key: IdentificationKey;

  beforeEach(() => {
    const natureGuide = new NatureGuide(NatureGuideFixture as any as NatureGuide);
    key = natureGuide.getIdentificationKey('8ce822aa-6472-4f8d-9814-cbe052b5d4d2') as IdentificationKey;
  })

  test('creating a new IdentificationKey fills the spaceNodeMapping', () => {
    expect(key.spaceNodeMapping.length).toEqual(52);
    expect(key.spaceNodeMapping[0].length).toEqual(8);
  })

  test('selecting a space updates the possibleNodes', () => {
    key.selectSpace(0);
    expect(key.possibleNodes).toEqual([1, 0, 1, 1, 0, 1, 0, 0]);
  })

  test('selecting a space updates the possibleSpaces', () => {
    expect(key.possibleSpaces[0]).toEqual(1);
    expect(key.possibleSpaces[1]).toEqual(1);
    key.selectSpace(0);
    expect(key.possibleSpaces[0]).toEqual(1);
    expect(key.possibleSpaces[1]).toEqual(0);
  })

  test('selecting two spaces updates the possibleNodes', () => {
    key.selectSpace(0);
    key.selectSpace(2);
    expect(key.possibleNodes).toEqual([0, 0, 0, 0, 0, 1, 0, 0]);
  })

  test('selecting two spaces updates the possibleSpaces', () => {
    expect(key.possibleSpaces[0]).toEqual(1);
    expect(key.possibleSpaces[1]).toEqual(1);
    key.selectSpace(0);
    expect(key.possibleSpaces[0]).toEqual(1);
    expect(key.possibleSpaces[1]).toEqual(0);
    expect(key.possibleSpaces[6]).toEqual(1);
    expect(key.possibleSpaces[7]).toEqual(1);
    key.selectSpace(2);
    expect(key.possibleSpaces[0]).toEqual(1);
    expect(key.possibleSpaces[1]).toEqual(0);
    expect(key.possibleSpaces[6]).toEqual(0);
    expect(key.possibleSpaces[7]).toEqual(1);
  })

  test('selecting another space updates the possibleNodes', () => {
    expect(key.possibleNodes[0]).toEqual(1)
    expect(key.possibleNodes[6]).toEqual(1)
    key.selectSpace(1);
    expect(key.possibleNodes[0]).toEqual(0)
    expect(key.possibleNodes[6]).toEqual(1)
  })

  test('selecting another space updates the possibleSpaces', () => {
    expect(key.possibleSpaces[0]).toEqual(1);
    key.selectSpace(1);
    expect(key.possibleSpaces[0]).toEqual(0);
  })

  test('selecting and deselecting a space updates the possibleNodes', () => {
    const possibleNodes = [...key.possibleNodes];
    key.selectSpace(0);
    key.deselectSpace(0);
    expect(key.possibleNodes).toEqual(possibleNodes);
  })

  test('selecting and deselecting a space updates the possibleSpaces', () => {
    const possibleSpaces = [...key.possibleSpaces];
    key.selectSpace(0);
    key.deselectSpace(0);
    expect(key.possibleSpaces).toEqual(possibleSpaces);
  })

  test('selecting a space notifies listeners', () => {
    const listener = vi.fn();
    key.on(IdentificationEvents.beforeSpaceSelected, listener);
    key.on(IdentificationEvents.spaceSelected, listener);
    key.selectSpace(0);
    expect(listener).toHaveBeenCalledWith(IdentificationEvents.beforeSpaceSelected, key, { index: 0, encodedSpace: null });
    expect(listener).toHaveBeenCalledWith(IdentificationEvents.spaceSelected, key, { index: 0, encodedSpace: null });
  })

  test('deselecting a space notifies listeners', () => {
    const listener = vi.fn();
    key.on(IdentificationEvents.spaceDeselected, listener);
    key.selectSpace(0);
    key.deselectSpace(0);
    expect(listener).toHaveBeenCalledWith(IdentificationEvents.spaceDeselected, key, { index: 0, encodedSpace: null });
  })

  test('selecting a space that is already selected does not notify listeners', () => {
    const listener = vi.fn();
    key.on(IdentificationEvents.spaceSelected, listener);
    key.selectSpace(0);
    key.selectSpace(0);
    expect(listener).toHaveBeenCalledTimes(1);
  })

  // describe('range filters', () => {
  //   test('selecting a range filter space filters out nodes that are not in the range', () => {
  //     key.selectSpace(3, [3.0]);
  //     expect(key.possibleNodes).toEqual([0, 1, 1]);
  //   })
  //
  //   test('selecting a range space again updates the possibleNodes', () => {
  //     key.selectSpace(3, [3.0]);
  //     key.selectSpace(3, [7.0]);
  //     expect(key.possibleNodes).toEqual([0, 0, 1]);
  //   })
  // })

  test('Getting the results returns the possible nodes', () => {
    key.selectSpace(0);
    expect(key.results).toEqual([key.children[0], key.children[5], key.children[2], key.children[3]]);
  })

  test('Getting the impossible results returns the impossible nodes', () => {
    key.selectSpace(0);
    expect(key.impossibleResults).toEqual([key.children[1], key.children[4], key.children[6], key.children[7]]);
  })

  describe('filterVisibilityRestrictions', () => {
    test('creating a new IdentificationKey fills the filterVisibilityRestrictions', () => {
      expect(key.filterVisibilityRestrictions).toEqual([
        [],
        [],
        [],
        [],
        [],
        [],
        [[0]],
      ]);
    })

    test('a filter with restrictions to be invisible after creation', () => {
      expect(key.visibleFilters).toEqual([1, 1, 1, 1, 1, 1, 0]);
    })

    test('selecting a space updates the possibleFilters', () => {
      const spy = vi.spyOn(key, 'notifyListeners')
      key.selectSpace(0);
      expect(key.visibleFilters).toEqual([1, 1, 1, 1, 1, 1, 1]);
      expect(spy).toHaveBeenCalledWith(
          IdentificationEvents.filterBecameVisible,
          { index: 6, filter: key.matrixFilters['da1bbf44-0a6c-4ab4-8853-78d271442644']}
      )
    })

    test('deselecting a space updates the possibleFilters', () => {
      const spy = vi.spyOn(key, 'notifyListeners')
      key.selectSpace(0);
      key.deselectSpace(0);
      expect(key.visibleFilters).toEqual([1, 1, 1, 1, 1, 1, 0]);
      expect(spy).toHaveBeenCalledWith(
          IdentificationEvents.filterBecameInvisible,
          { index: 6, filter: key.matrixFilters['da1bbf44-0a6c-4ab4-8853-78d271442644']}
      )
    })

    test('deselecting a space automatically deselects spaces in a filter that becomes invisible', () => {
      const restrictedSpace = { spaceIdentifier: 'da1bbf44-0a6c-4ab4-8853-78d271442644:179' } as MatrixFilterSpace
      key.selectSpace(0)
      key.selectSpace(key.findSpaceIndex(restrictedSpace))
      expect(key.isSpaceSelected(restrictedSpace)).toEqual(true)
      key.deselectSpace(0)
      expect(key.isSpaceSelected(restrictedSpace)).toEqual(false)
    })


    // test('selecting a space only makes filters visible that are restricted by it', () => {
    //   key.selectSpace(3, [3.0]);
    //   expect(key.visibleFilters).toEqual([1, 0, 1]);
    // })
  })

  describe('fluid mode', () => {
    beforeEach(() => {
      key.identificationMode = IdentificationModes.fluid;
    })

    test('selecting a space in fluid mode updates its points', () => {
      key.selectSpace(0);
      expect(key.points[key.children[0].uuid]).toEqual(1);
    })

    test('deselecting a space removes points from it', () => {
      key.selectSpace(0);
      key.deselectSpace(0);
      expect(key.points[key.children[0].uuid]).toEqual(0);
    })

    test('selecting two spaces sums their points', () => {
      key.selectSpace(0);
      key.selectSpace(6);
      expect(key.points[key.children[0].uuid]).toEqual(2);
      expect(key.points[key.children[2].uuid]).toEqual(2);
    })
  });
})