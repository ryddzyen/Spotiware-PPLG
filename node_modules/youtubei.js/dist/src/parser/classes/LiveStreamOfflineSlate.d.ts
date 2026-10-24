import { type ObservedArray, YTNode } from '../helpers.js';
import { type RawNode } from '../index.js';
import Text from './misc/Text.js';
import Button from './Button.js';
import Thumbnail from './misc/Thumbnail.js';
export default class LiveStreamOfflineSlate extends YTNode {
    static type: string;
    main_text: Text;
    subtitle_text: Text;
    thumbnail: Thumbnail[];
    action_buttons: ObservedArray<Button>;
    constructor(data: RawNode);
}
