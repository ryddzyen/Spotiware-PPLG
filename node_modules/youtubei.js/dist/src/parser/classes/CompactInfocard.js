import { Parser } from '../index.js';
import { YTNode } from '../helpers.js';
export default class CompactInfocard extends YTNode {
    static type = 'CompactInfocard';
    content;
    constructor(data) {
        super();
        this.content = Parser.parseItem(data.content);
    }
}
//# sourceMappingURL=CompactInfocard.js.map