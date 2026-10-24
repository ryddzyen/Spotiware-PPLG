import { YTNode } from '../helpers.js';
import { type RawNode } from '../index.js';
import Text from './misc/Text.js';
import RendererContext from './misc/RendererContext.js';
import ButtonView from './ButtonView.js';
export default class VideoTitleHeaderView extends YTNode {
    static type: string;
    video_title: Text;
    header_button: ButtonView | null;
    renderer_context?: RendererContext;
    constructor(data: RawNode);
}
