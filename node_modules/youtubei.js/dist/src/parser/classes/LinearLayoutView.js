import { YTNode } from '../helpers.js';
import { Parser } from '../index.js';
import RendererContext from './misc/RendererContext.js';
export default class LinearLayoutView extends YTNode {
    static type = 'LinearLayoutView';
    items;
    renderer_context;
    constructor(data) {
        super();
        this.items = Parser.parseArray(data.items);
        if ('rendererContext' in data)
            this.renderer_context = new RendererContext(data.rendererContext);
    }
}
//# sourceMappingURL=LinearLayoutView.js.map