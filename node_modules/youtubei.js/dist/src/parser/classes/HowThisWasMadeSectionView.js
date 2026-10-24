import { YTNode } from '../helpers.js';
import Text from './misc/Text.js';
export default class HowThisWasMadeSectionView extends YTNode {
    static type = 'HowThisWasMadeSectionView';
    section_title;
    body_text;
    body_header;
    attribution_text;
    constructor(data) {
        super();
        if (Reflect.has(data, 'sectionText'))
            this.section_title = Text.fromAttributed(data.sectionText);
        if (Reflect.has(data, 'bodyText'))
            this.body_text = Text.fromAttributed(data.bodyText);
        if (Reflect.has(data, 'bodyHeader'))
            this.body_header = Text.fromAttributed(data.bodyHeader);
        if (Reflect.has(data, 'attributionText'))
            this.attribution_text = Text.fromAttributed(data.attributionText);
    }
}
//# sourceMappingURL=HowThisWasMadeSectionView.js.map