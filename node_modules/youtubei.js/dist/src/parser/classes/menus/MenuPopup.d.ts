import { YTNode } from '../../helpers.js';
import type { ObservedArray } from '../../helpers.js';
import type { RawNode } from '../../index.js';
import MenuCustomIconItem from '../MenuCustomIconItem.js';
import MenuNavigationItem from './MenuNavigationItem.js';
import MenuServiceItem from './MenuServiceItem.js';
export default class MenuPopup extends YTNode {
    static type: string;
    items: ObservedArray<MenuNavigationItem | MenuServiceItem | MenuCustomIconItem>;
    constructor(data: RawNode);
}
