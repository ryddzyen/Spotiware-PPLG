import { YTNode } from '../helpers.js';
import { Parser } from '../index.js';
import { Text, Thumbnail } from '../misc.js';
import ButtonView from './ButtonView.js';
export default class InterstitialView extends YTNode {
    static type = 'InterstitialView';
    title;
    description;
    icon;
    primary_button;
    constructor(data) {
        super();
        this.title = Text.fromAttributed(data.title);
        this.description = Text.fromAttributed(data.description);
        if ('icon' in data) {
            this.icon = Thumbnail.fromResponse(data.icon);
        }
        this.primary_button = Parser.parseItem(data.primaryButton, ButtonView);
    }
}
//# sourceMappingURL=InterstitialView.js.map