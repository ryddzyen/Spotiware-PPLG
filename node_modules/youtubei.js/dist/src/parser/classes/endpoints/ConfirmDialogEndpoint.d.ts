import { YTNode } from '../../helpers.js';
import { type RawNode } from '../../index.js';
import ConfirmDialog from '../ConfirmDialog.js';
export default class ConfirmDialogEndpoint extends YTNode {
    static type: string;
    content: ConfirmDialog | null;
    constructor(data: RawNode);
}
