import { YTNode } from '../helpers.js';
import { type RawNode } from '../index.js';
import { Text, Thumbnail } from '../misc.js';
import ButtonView from './ButtonView.js';
export default class InterstitialView extends YTNode {
    static type: string;
    title: Text;
    description: Text;
    icon?: Thumbnail[];
    primary_button: ButtonView | null;
    constructor(data: RawNode);
}
