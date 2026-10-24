import { YTNode } from '../helpers.js';
import { Parser } from '../index.js';
import Text from './misc/Text.js';
export default class VideoDescriptionGamingSection extends YTNode {
    static type = 'VideoDescriptionGamingSection';
    media_lockups;
    section_title;
    topic_link; // @TODO: Find out what type this is.
    constructor(data) {
        super();
        this.media_lockups = Parser.parseArray(data.mediaLockups);
        this.section_title = new Text(data.sectionTitle);
        this.topic_link = Parser.parseItem(data.topicLink);
    }
}
//# sourceMappingURL=VideoDescriptionGamingSection.js.map