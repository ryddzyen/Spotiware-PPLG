import { YTNode } from '../helpers.js';
import NavigationEndpoint from './NavigationEndpoint.js';
export default class MenuCustomIconItem extends YTNode {
    static type = 'MenuCustomIconItem';
    action_text;
    command;
    constructor(data) {
        super();
        this.action_text = new Text(data.actionText);
        if ('command' in data)
            this.command = new NavigationEndpoint(data.command);
    }
}
//# sourceMappingURL=MenuCustomIconItem.js.map