import { YTNode } from '../helpers.js';
import { Parser } from '../index.js';
import ListItemView from './ListItemView.js';
export default class ToggleableListItemView extends YTNode {
    static type = 'ToggleableListItemView';
    default_list_item;
    toggled_list_item;
    initial_state;
    entity_key;
    entity_selector_type;
    constructor(data) {
        super();
        this.default_list_item = Parser.parseItem(data.defaultListItem, ListItemView);
        this.toggled_list_item = Parser.parseItem(data.toggledListItem, ListItemView);
        this.initial_state = {
            is_toggled: !!data.initialState?.isToggled
        };
        this.entity_key = data.entityKey;
        this.entity_selector_type = data.entitySelectorType;
    }
    /**
     * The list item matching the current toggle state.
     */
    get list_item() {
        return this.initial_state.is_toggled ? this.toggled_list_item : this.default_list_item;
    }
    get is_toggled() {
        return this.initial_state.is_toggled;
    }
}
//# sourceMappingURL=ToggleableListItemView.js.map