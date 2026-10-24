import type { RawNode } from '../../index.js';
export interface ClientResource {
    bundle_id?: string;
    image_color?: number;
    image_name?: string;
}
export default class Thumbnail {
    url: string;
    width: number;
    height: number;
    client_resource?: ClientResource;
    constructor(data: RawNode);
    /**
     * Get thumbnails from response object.
     */
    static fromResponse(data: any): Thumbnail[];
}
