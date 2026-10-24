import { YTNode } from '../helpers.js';
import { Parser } from '../index.js';
import Text from './misc/Text.js';
import RendererContext from './misc/RendererContext.js';
import ButtonView from './ButtonView.js';
export default class VideoTitleHeaderView extends YTNode {
    static type = 'VideoTitleHeaderView';
    video_title;
    header_button;
    renderer_context;
    constructor(data) {
        super();
        this.video_title = Text.fromAttributed(data.videoTitle);
        this.header_button = Parser.parseItem(data.headerButton, ButtonView);
        if ('rendererContext' in data) {
            this.renderer_context = new RendererContext(data.rendererContext);
        }
    }
}
//# sourceMappingURL=VideoTitleHeaderView.js.map