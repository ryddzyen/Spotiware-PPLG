import { YTNode } from '../helpers.js';
import Text from './misc/Text.js';
import type { RawNode } from '../types/index.js';
import RendererContext from './misc/RendererContext.js';
export default class CourseProgressView extends YTNode {
    static type: string;
    title: Text;
    progress_summary: Text;
    progress_percentage?: number;
    renderer_context?: RendererContext;
    constructor(data: RawNode);
}
