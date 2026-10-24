import { Parser } from '../index.js';
import { YTNode } from '../helpers.js';
import Thumbnail from './misc/Thumbnail.js';
import NavigationEndpoint from './NavigationEndpoint.js';
import Text from './misc/Text.js';
export default class StructuredDescriptionVideoLockup extends YTNode {
    static type = 'StructuredDescriptionVideoLockup';
    thumbnail;
    title;
    short_byline_text;
    metadata_details;
    endpoint;
    length_text;
    is_live_video;
    disable_navigation_endpoint;
    max_lines_title;
    max_lines_short_byline_text;
    max_lines_metadata_details;
    thumbnail_width;
    aspect_ratio;
    thumbnail_overlays;
    constructor(data) {
        super();
        this.title = new Text(data.title);
        if ('shortBylineText' in data)
            this.short_byline_text = new Text(data.shortBylineText);
        if ('metadataDetails' in data)
            this.metadata_details = new Text(data.metadataDetails);
        this.endpoint = new NavigationEndpoint(data.navigationEndpoint);
        if ('lengthText' in data)
            this.length_text = new Text(data.lengthText);
        this.thumbnail = Thumbnail.fromResponse(data.thumbnail);
        this.is_live_video = !!data.isLiveVideo;
        this.disable_navigation_endpoint = !!data.disableNavigationEndpoint;
        this.max_lines_title = data.maxLinesTitle;
        this.max_lines_short_byline_text = data.maxLinesShortBylineText;
        this.max_lines_metadata_details = data.maxLinesMetadataDetails;
        this.thumbnail_width = data.thumbnailWidth;
        this.aspect_ratio = data.aspectRatio;
        this.thumbnail_overlays = Parser.parseArray(data.thumbnailOverlays);
    }
}
//# sourceMappingURL=StructuredDescriptionVideoLockup.js.map