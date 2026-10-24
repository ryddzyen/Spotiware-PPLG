import { YTNode } from '../../helpers.js';
import RendererContext from '../misc/RendererContext.js';
import Thumbnail from '../misc/Thumbnail.js';
export default class CommentImageAttachmentView extends YTNode {
    static type = 'CommentImageAttachmentView';
    width;
    height;
    aspect_ratio;
    image;
    image_content_mode;
    processor;
    image_format_hint;
    external_image_id;
    unavailable_text;
    unsupported_text;
    renderer_context;
    constructor(data) {
        super();
        this.width = data.width;
        this.height = data.height;
        this.aspect_ratio = data.aspectRatio;
        this.image = Thumbnail.fromResponse(data.image);
        this.external_image_id = data.externalImageId;
        this.unavailable_text = data.unavailableText;
        this.unsupported_text = data.unsupportedText;
        this.renderer_context = new RendererContext(data.rendererContext);
        if (typeof data.image === 'object') {
            this.image_content_mode = data.image.contentMode;
            this.image_format_hint = data.image.imageFormatHint;
            if (data.image.processor?.borderImageProcessor?.cornerRadius) {
                this.processor = {
                    border_image_processor: {
                        corner_radius: data.image.processor.borderImageProcessor.cornerRadius
                    }
                };
            }
        }
    }
}
//# sourceMappingURL=CommentImageAttachmentView.js.map