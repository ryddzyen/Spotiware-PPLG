import { YTNode } from '../helpers.js';
import { Parser } from '../index.js';
export default class CompositeVideoPrimaryInfo extends YTNode {
    static type = 'CompositeVideoPrimaryInfo';
    composite_source_video_primary_info_renderers;
    constructor(data) {
        super();
        this.composite_source_video_primary_info_renderers = Parser.parseArray(data.compositeSourceVideoPrimaryInfoRenderers);
    }
}
//# sourceMappingURL=CompositeVideoPrimaryInfo.js.map