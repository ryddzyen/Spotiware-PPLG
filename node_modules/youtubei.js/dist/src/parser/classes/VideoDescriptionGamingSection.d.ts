import { type ObservedArray, YTNode } from '../helpers.js';
import { type RawNode } from '../index.js';
import Text from './misc/Text.js';
export default class VideoDescriptionGamingSection extends YTNode {
    static type: string;
    media_lockups: ObservedArray<YTNode>;
    section_title: Text;
    topic_link: YTNode;
    constructor(data: RawNode);
}
