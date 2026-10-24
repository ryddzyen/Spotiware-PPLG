import { type RawNode } from '../index.js';
import { YTNode } from '../helpers.js';
import Text from './misc/Text.js';
import Thumbnail from './misc/Thumbnail.js';
import NavigationEndpoint from './NavigationEndpoint.js';
export interface UITweaks {
    use_zero_padding?: boolean;
    thumbnail_width?: number;
    thumbnail_height?: number;
}
export default class MediaLockup extends YTNode {
    static type: string;
    title: Text;
    subtitle: Text;
    thumbnail_details: Thumbnail[];
    endpoint: NavigationEndpoint;
    enable_subtitle_launch_icon: boolean;
    ui_tweaks?: UITweaks;
    max_lines_title?: number;
    max_lines_subtitle?: number;
    disable_endpoint: boolean;
    constructor(data: RawNode);
}
