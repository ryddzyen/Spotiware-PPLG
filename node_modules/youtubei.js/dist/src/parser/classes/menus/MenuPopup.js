import { Parser } from '../../index.js';
import { YTNode } from '../../helpers.js';
import MenuCustomIconItem from '../MenuCustomIconItem.js';
import MenuNavigationItem from './MenuNavigationItem.js';
import MenuServiceItem from './MenuServiceItem.js';
export default class MenuPopup extends YTNode {
    static type = 'MenuPopup';
    items;
    constructor(data) {
        super();
        this.items = Parser.parseArray(data.items, [MenuNavigationItem, MenuServiceItem, MenuCustomIconItem]);
    }
}
//# sourceMappingURL=MenuPopup.js.map