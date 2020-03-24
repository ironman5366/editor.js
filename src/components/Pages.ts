import * as _ from './utils';
import $ from './dom';
import {MoveEvent, MoveEventDetail} from '../../types/tools';
import Page from './page';

/**
 * @class Blocks
 * @classdesc Class to work with Block instances array
 *
 * @private
 *
 * @property {HTMLElement} workingArea — editor`s working node
 *
 */
export default class Pages {
  /**
   * Get length of Block instances array
   *
   * @returns {Number}
   */
  public get length(): number {
    return this.pages.length;
  }

  /**
   * Get Page instances array
   *
   * @returns {Page[]}
   */
  public get array(): Page[] {
    return this.pages;
  }

  /**
   * Proxy trap to implement array-like setter
   *
   * @example
   * pages[0] = new Page(...)
   *
   * @param {Pages} instance — Pages instance
   * @param {Number|String} property — page index or any Pages class property to set
   * @param {Page} value — value to set
   * @returns {Boolean}
   */
  public static set(instance: Pages, property: number | string, value: Page | any) {

    /**
     * If property name is not a number (method or other property, access it via reflect
     */
    if (isNaN(Number(property))) {
      Reflect.set(instance, property, value);
      return true;
    }

    /**
     * If property is number, call insert method to emulate array behaviour
     *
     * @example
     * blocks[0] = new Block();
     */
    instance.insert(+property, value);

    return true;
  }

  /**
   * Proxy trap to implement array-like getter
   *
   * @param {Pages} instance — Pages instance
   * @param {Number|String} property — Pages class property
   * @returns {Page|*}
   */
  public static get(instance: Pages, property: any | number) {

    /**
     * If property is not a number, get it via Reflect object
     */
    if (isNaN(Number(property))) {
      return Reflect.get(instance, property);
    }

    /**
     * If property is a number (Block index) return Block by passed index
     */
    return instance.get(+property);
  }

  /**
   * Array of Page instances in order of addition
   */
  public pages: Page[];

  /**
   * Editor`s area where to add Block`s HTML
   */
  public workingArea: HTMLElement;

  /**
   * @constructor
   *
   * @param {HTMLElement} workingArea — editor`s working node
   */
  constructor(workingArea: HTMLElement) {
    this.pages = [];
    this.workingArea = workingArea;
  }

  /**
   * Push new Block to the blocks array and append it to working area
   *
   * @param {Page} page
   */
  public push(page: Page): void {
    this.pages.push(page);
    this.insertToDOM(page);
  }

  /**
   * Swaps pages with indexes first and second
   * @param {Number} first - first page index
   * @param {Number} second - second page index
   * @deprecated — use 'move' instead
   */
  public swap(first: number, second: number): void {
    const secondPage = this.pages[second];

    /**
     * Change in DOM
     */
    $.swap(this.pages[first].holder, secondPage.holder);

    /**
     * Change in array
     */
    this.pages[second] = this.pages[first];
    this.pages[first] = secondPage;
  }

  /**
   * Move a page from one to another index
   * @param {Number} toIndex - new index of the page
   * @param {Number} fromIndex - page to move
   */
  public move(toIndex: number, fromIndex: number): void {
    /**
     * cut out the page, move the DOM element and insert at the desired index
     * again (the shifting within the blocks array will happen automatically).
     * @see https://stackoverflow.com/a/44932690/1238150
     */
    const page = this.pages.splice(fromIndex, 1)[0];

    // manipulate DOM
    const prevIndex = toIndex - 1;
    const previousPageIndex = Math.max(0, prevIndex);
    const previousPage = this.pages[previousPageIndex];

    if (toIndex > 0) {
      this.insertToDOM(page, 'afterend', previousPage);
    } else {
      this.insertToDOM(page, 'beforebegin', previousPage);
    }

    // move in array
    this.pages.splice(toIndex, 0, page );

    // invoke hook
    const event: MoveEvent = this.composePageEvent('move', {
      fromIndex,
      toIndex,
    });
  }

  /**
   * Insert new Page at passed index
   *
   * @param {Number} index — index to insert Page
   * @param {Page} page — Page to insert
   * @param {Boolean} replace — it true, replace block on given index
   */
  public insert(index: number, page: Page, replace: boolean = false): void {
    if (!this.length) {
      this.push(page);
      return;
    }

    if (index > this.length) {
      index = this.length;
    }

    if (replace) {
      this.pages[index].holder.remove();
    }

    const deleteCount = replace ? 1 : 0;

    this.pages.splice(index, deleteCount, page);

    if (index > 0) {
      const previousPage = this.pages[index - 1];

      this.insertToDOM(page, 'afterend', previousPage);
    } else {
      const nextPage = this.pages[index + 1];

      if (nextPage) {
        this.insertToDOM(page, 'beforebegin', nextPage);
      } else {
        this.insertToDOM(page);
      }
    }
  }

  /**
   * Remove page
   * @param {Number|null} index
   */
  public remove(index: number): void {
    if (isNaN(index)) {
      index = this.length - 1;
    }

    this.pages[index].holder.remove();

    this.pages.splice(index, 1);
  }

  /**
   * Remove all pages
   */
  public removeAll(): void {
    this.workingArea.innerHTML = '';
    this.pages.length = 0;
  }

  /**
   * Get Page by index
   *
   * @param {Number} index — Page index
   * @returns {Page}
   */
  public get(index: number): Page {
    return this.pages[index];
  }

  /**
   * Return index of passed Page
   *
   * @param {Page} page
   * @returns {Number}
   */
  public indexOf(page: Page): number {
    return this.pages.indexOf(page);
  }

  /**
   * Insert new Page into DOM
   *
   * @param {Page} page - Page to insert
   * @param {InsertPosition} position — insert position (if set, will use insertAdjacentElement)
   * @param {Page} target — Page related to position
   */
  private insertToDOM(page: Page, position?: InsertPosition, target?: Page): void {
    if (position) {
      target.holder.insertAdjacentElement(position, page.holder);
    } else {
      this.workingArea.appendChild(page.holder);
    }
  }

  /**
   * Composes Page event with passed type and details
   *
   * @param {String} type
   * @param {MoveEventDetail} detail
   */
  private composePageEvent(type: string, detail: MoveEventDetail): MoveEvent {
    return new CustomEvent(type, {
        detail,
      },
    ) as MoveEvent;
  }
}
