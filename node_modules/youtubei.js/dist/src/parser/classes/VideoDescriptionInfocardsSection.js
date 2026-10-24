import { Parser } from '../index.js';
import { YTNode } from '../helpers.js';
import Text from './misc/Text.js';
import Thumbnail from './misc/Thumbnail.js';
import Button from './Button.js';
import NavigationEndpoint from './NavigationEndpoint.js';
import ButtonView from './ButtonView.js';
export default class VideoDescriptionInfocardsSection extends YTNode {
    static type = 'VideoDescriptionInfocardsSection';
    section_title;
    creator_videos_button;
    creator_about_button;
    creator_custom_url_buttons;
    section_subtitle;
    channel_avatar;
    channel_endpoint;
    infocards;
    constructor(data) {
        super();
        this.section_title = new Text(data.sectionTitle);
        this.creator_videos_button = Parser.parseItem(data.creatorVideosButton, Button);
        this.creator_about_button = Parser.parseItem(data.creatorAboutButton, Button);
        this.section_subtitle = new Text(data.sectionSubtitle);
        this.creator_custom_url_buttons = Parser.parseArray(data.creatorCustomUrlButtons, ButtonView);
        this.channel_avatar = Thumbnail.fromResponse(data.channelAvatar);
        this.channel_endpoint = new NavigationEndpoint(data.channelEndpoint);
        this.infocards = Parser.parseArray(data.infocards);
    }
}
//# sourceMappingURL=VideoDescriptionInfocardsSection.js.map