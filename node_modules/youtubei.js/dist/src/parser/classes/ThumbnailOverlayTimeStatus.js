import Text from './misc/Text.js';
import { YTNode } from '../helpers.js';
export default class ThumbnailOverlayTimeStatus extends YTNode {
    static type = 'ThumbnailOverlayTimeStatus';
    text;
    style;
    icon_type;
    constructor(data) {
        super();
        this.text = new Text(data.text).toString();
        this.style = data.style;
        if ('icon' in data) {
            this.icon_type = data.icon.iconType;
        }
    }
}
//# sourceMappingURL=ThumbnailOverlayTimeStatus.js.map