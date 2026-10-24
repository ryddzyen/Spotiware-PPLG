import { YTNode } from '../helpers.js';
import { type RawNode } from '../index.js';
import ThumbnailView from './ThumbnailView.js';
import CollectionThumbnailView from './CollectionThumbnailView.js';
import LockupMetadataView from './LockupMetadataView.js';
import RendererContext from './misc/RendererContext.js';
export type LockupContentType = 'UNSPECIFIED' | 'VIDEO' | 'PLAYLIST' | 'SHORT' | 'CHANNEL' | 'ALBUM' | 'PRODUCT' | 'GAME' | 'CLIP' | 'PODCAST' | 'SOURCE' | 'SHOPPING_COLLECTION' | 'MOVIE' | 'STATION' | 'SHOW' | 'COURSE';
export interface LockupStyling {
    layout?: string;
    content_image_aspect_ratio?: string;
}
export default class LockupView extends YTNode {
    static type: string;
    content_image: CollectionThumbnailView | ThumbnailView | null;
    metadata: LockupMetadataView | null;
    content_id?: string;
    content_type: LockupContentType;
    styling?: LockupStyling;
    renderer_context: RendererContext;
    constructor(data: RawNode);
    /**
     * The video's duration, parsed from its thumbnail overlay badge (e.g. "16:09").
     * Returns an empty duration for lockups without one (playlists, channels, live videos, etc.).
     */
    get duration(): {
        text: string;
        seconds: number;
    };
}
