import { YTNode } from '../helpers.js';
import { type RawNode } from '../index.js';
import InterstitialView from './InterstitialView.js';
export default class PlayerInterstitial extends YTNode {
    static type: string;
    content: InterstitialView | null;
    state_entity_store_key?: string;
    constructor(data: RawNode);
}
