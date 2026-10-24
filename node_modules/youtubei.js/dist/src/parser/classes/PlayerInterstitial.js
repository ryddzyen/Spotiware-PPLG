import { YTNode } from '../helpers.js';
import { Parser } from '../index.js';
import InterstitialView from './InterstitialView.js';
export default class PlayerInterstitial extends YTNode {
    static type = 'PlayerInterstitial';
    content;
    state_entity_store_key;
    constructor(data) {
        super();
        this.content = Parser.parseItem(data.content, InterstitialView);
        if ('stateEntityStoreKey' in data) {
            this.state_entity_store_key = data.stateEntityStoreKey;
        }
    }
}
//# sourceMappingURL=PlayerInterstitial.js.map