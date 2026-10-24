import { YTNode } from '../helpers.js';
import Text from './misc/Text.js';
import Thumbnail from './misc/Thumbnail.js';
import NavigationEndpoint from './NavigationEndpoint.js';
export default class MediaLockup extends YTNode {
    static type = 'MediaLockup';
    title;
    subtitle;
    thumbnail_details;
    endpoint;
    enable_subtitle_launch_icon;
    ui_tweaks;
    max_lines_title;
    max_lines_subtitle;
    disable_endpoint;
    constructor(data) {
        super();
        this.title = new Text(data.title);
        this.subtitle = new Text(data.subtitle);
        this.thumbnail_details = Thumbnail.fromResponse(data.thumbnailDetails);
        this.endpoint = new NavigationEndpoint(data.endpoint);
        this.enable_subtitle_launch_icon = !!data.enableSubtitleLaunchIcon;
        if ('uiTweaks' in data)
            this.ui_tweaks = {
                use_zero_padding: data.uiTweaks.useZeroPadding,
                thumbnail_width: data.uiTweaks.thumbnailWidth,
                thumbnail_height: data.uiTweaks.thumbnailHeight
            };
        this.max_lines_title = data.maxLinesTitle;
        this.max_lines_subtitle = data.maxLinesSubtitle;
        this.disable_endpoint = !!data.disableEndpoint;
    }
}
//# sourceMappingURL=MediaLockup.js.map