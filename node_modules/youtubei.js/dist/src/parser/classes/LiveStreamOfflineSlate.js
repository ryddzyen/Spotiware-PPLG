import { YTNode } from '../helpers.js';
import { Parser } from '../index.js';
import Text from './misc/Text.js';
import Button from './Button.js';
import Thumbnail from './misc/Thumbnail.js';
export default class LiveStreamOfflineSlate extends YTNode {
    static type = 'LiveStreamOfflineSlate';
    main_text;
    subtitle_text;
    thumbnail;
    action_buttons;
    constructor(data) {
        super();
        this.main_text = new Text(data.mainText);
        this.subtitle_text = new Text(data.subtitleText);
        this.thumbnail = Thumbnail.fromResponse(data.thumbnail);
        this.action_buttons = Parser.parseArray(data.actionButtons, Button);
    }
}
//# sourceMappingURL=LiveStreamOfflineSlate.js.map