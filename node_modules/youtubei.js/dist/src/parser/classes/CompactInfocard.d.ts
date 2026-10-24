import { type RawNode } from '../index.js';
import { YTNode } from '../helpers.js';
export default class CompactInfocard extends YTNode {
    static type: string;
    content: YTNode | null;
    constructor(data: RawNode);
}
