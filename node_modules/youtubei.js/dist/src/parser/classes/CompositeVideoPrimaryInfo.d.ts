import { type ObservedArray, YTNode } from '../helpers.js';
import type { RawNode } from '../types/index.js';
export default class CompositeVideoPrimaryInfo extends YTNode {
    static type: string;
    composite_source_video_primary_info_renderers: ObservedArray<YTNode>;
    constructor(data: RawNode);
}
