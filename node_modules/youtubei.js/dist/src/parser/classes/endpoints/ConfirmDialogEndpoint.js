import { YTNode } from '../../helpers.js';
import { Parser } from '../../index.js';
import ConfirmDialog from '../ConfirmDialog.js';
export default class ConfirmDialogEndpoint extends YTNode {
    static type = 'ConfirmDialogEndpoint';
    content;
    constructor(data) {
        super();
        this.content = Parser.parseItem(data.content, ConfirmDialog);
    }
}
//# sourceMappingURL=ConfirmDialogEndpoint.js.map