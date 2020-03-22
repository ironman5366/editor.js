import {BlockToolData} from '../tools';

export interface OutputObject {
  type: string;
  data: BlockToolData;
}

export interface OutputData {
  /**
   * Editor's version
   */
  version?: string;

  /**
   * Timestamp of saving in milliseconds
   */
  time?: number;

  /**
   * Saved Blocks
   */
  blocks: {
    [index: number]: OutputObject;
  };
}
