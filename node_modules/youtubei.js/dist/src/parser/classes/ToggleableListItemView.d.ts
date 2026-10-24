import type { RawNode } from '../types/RawResponse.js';
import { YTNode } from '../helpers.js';
import ListItemView from './ListItemView.js';
export default class ToggleableListItemView extends YTNode {
    static type: string;
    default_list_item: ListItemView | null;
    toggled_list_item: ListItemView | null;
    initial_state: {
        is_toggled: boolean;
    };
    entity_key?: string;
    entity_selector_type?: string;
    constructor(data: RawNode);
    /**
     * The list item matching the current toggle state.
     */
    get list_item(): ListItemView | null;
    get is_toggled(): boolean;
}
