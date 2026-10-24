import { YTNode } from '../../helpers.js';
import type { RawNode } from '../../types/RawResponse.js';
import RendererContext from '../misc/RendererContext.js';
import Thumbnail from '../misc/Thumbnail.js';
export default class CommentImageAttachmentView extends YTNode {
    static type: string;
    width: number;
    height: number;
    aspect_ratio: number;
    image: Thumbnail[];
    image_content_mode?: string;
    processor?: {
        border_image_processor: {
            corner_radius: number;
        };
    };
    image_format_hint?: string;
    external_image_id: string;
    unavailable_text: string;
    unsupported_text: string;
    renderer_context: RendererContext;
    constructor(data: RawNode);
}
