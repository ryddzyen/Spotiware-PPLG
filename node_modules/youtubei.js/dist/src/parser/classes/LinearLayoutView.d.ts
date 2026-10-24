import { type ObservedArray, YTNode } from '../helpers.js';
import { type RawNode } from '../index.js';
import RendererContext from './misc/RendererContext.js';
export default class LinearLayoutView extends YTNode {
    static type: string;
    items: ObservedArray<YTNode>;
    renderer_context?: RendererContext;
    constructor(data: RawNode);
}
