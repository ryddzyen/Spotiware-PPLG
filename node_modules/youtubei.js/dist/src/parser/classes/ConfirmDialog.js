import { Parser } from '../index.js';
import Text from './misc/Text.js';
import Button from './Button.js';
import NavigationEndpoint from './NavigationEndpoint.js';
import { YTNode } from '../helpers.js';
export default class ConfirmDialog extends YTNode {
    static type = 'ConfirmDialog';
    title;
    confirm_endpoint;
    confirm_button;
    cancel_button;
    dialog_messages;
    primary_is_cancel;
    constructor(data) {
        super();
        this.title = new Text(data.title);
        if ('confirmEndpoint' in data)
            this.confirm_endpoint = new NavigationEndpoint(data.confirmEndpoint);
        this.confirm_button = Parser.parseItem(data.confirmButton, Button);
        this.cancel_button = Parser.parseItem(data.cancelButton, Button);
        this.dialog_messages = data.dialogMessages.map((txt) => new Text(txt));
        this.primary_is_cancel = !!data.primaryIsCancel;
    }
}
//# sourceMappingURL=ConfirmDialog.js.map