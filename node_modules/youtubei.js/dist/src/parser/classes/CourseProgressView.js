import { YTNode } from '../helpers.js';
import Text from './misc/Text.js';
import RendererContext from './misc/RendererContext.js';
export default class CourseProgressView extends YTNode {
    static type = 'CourseProgressView';
    title;
    progress_summary;
    progress_percentage;
    renderer_context;
    constructor(data) {
        super();
        this.title = Text.fromAttributed(data.title);
        this.progress_summary = Text.fromAttributed(data.progressSummary);
        this.progress_percentage = data.progressPercentage;
        if ('rendererContext' in data)
            this.renderer_context = new RendererContext(data.rendererContext);
    }
}
//# sourceMappingURL=CourseProgressView.js.map