import { YTNode } from '../helpers.js';
import { type RawNode } from '../index.js';
import NavigationEndpoint from './NavigationEndpoint.js';
export default class MenuCustomIconItem extends YTNode {
    static type: string;
    action_text: Text;
    command?: NavigationEndpoint;
    constructor(data: RawNode);
}
