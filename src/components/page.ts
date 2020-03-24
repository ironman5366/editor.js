/**
 * @class Page
 * @classdesc This class describes editor`s page, including page`s HTMLElement, data and tool
 *
 * @property {Object} CSS — block`s css classes
 *
 */

/** Import default tunes */

import Block from './block';

/**
 * @classdesc Abstract Block class that contains Block information, Tool name and Tool class instance
 *
 * @property tool - Tool instance
 * @property html - Returns HTML content of plugin
 * @property holder - Div element that wraps block content with Tool's content. Has `ce-block` CSS class
 * @property pluginsContent - HTML content that returns by Tool's render function
 */
export default class Page {

  /**
   * CSS classes for the Page
   * @return {{wrapper: string, content: string}}
   */
  static get CSS() {
    return {
      wrapper: 'ce-page',
      wrapperStretched: 'ce-block--stretched',
      content: 'ce-block__content',
      focused: 'ce-block--focused',
      selected: 'ce-block--selected',
      dropTarget: 'ce-block--drop-target',
    };
  }

  public blocks: Block[];

  /**
   * Wrapper for Pages`s content
   */
  public holder: HTMLDivElement;

}
