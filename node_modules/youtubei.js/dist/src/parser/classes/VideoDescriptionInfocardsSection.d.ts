import { type RawNode } from '../index.js';
import { type ObservedArray, YTNode } from '../helpers.js';
import Text from './misc/Text.js';
import Thumbnail from './misc/Thumbnail.js';
import Button from './Button.js';
import NavigationEndpoint from './NavigationEndpoint.js';
import ButtonView from './ButtonView.js';
export default class VideoDescriptionInfocardsSection extends YTNode {
    static type: string;
    section_title: Text;
    creator_videos_button: Button | null;
    creator_about_button: Button | null;
    creator_custom_url_buttons: ObservedArray<ButtonView>;
    section_subtitle: Text;
    channel_avatar: Thumbnail[];
    channel_endpoint: NavigationEndpoint;
    infocards: ObservedArray<YTNode>;
    constructor(data: RawNode);
}
