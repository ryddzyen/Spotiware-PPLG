import { type RawNode } from '../index.js';
import { type ObservedArray, YTNode } from '../helpers.js';
import Thumbnail from './misc/Thumbnail.js';
import NavigationEndpoint from './NavigationEndpoint.js';
import Text from './misc/Text.js';
export default class StructuredDescriptionVideoLockup extends YTNode {
    static type: string;
    thumbnail: Thumbnail[];
    title: Text;
    short_byline_text?: Text;
    metadata_details?: Text;
    endpoint: NavigationEndpoint;
    length_text?: Text;
    is_live_video: boolean;
    disable_navigation_endpoint: boolean;
    max_lines_title?: number;
    max_lines_short_byline_text?: number;
    max_lines_metadata_details?: number;
    thumbnail_width?: number;
    aspect_ratio?: number;
    thumbnail_overlays: ObservedArray<YTNode>;
    constructor(data: RawNode);
}
