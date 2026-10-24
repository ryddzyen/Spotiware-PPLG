import Feed from '../../core/mixins/Feed.js';
import ItemSection from '../classes/ItemSection.js';
import BrowseFeedActions from '../classes/BrowseFeedActions.js';
import type { Actions, ApiResponse } from '../../core/index.js';
import type { IBrowseResponse } from '../types/index.js';
import type { ObservedArray } from '../helpers.js';
export default class History extends Feed<IBrowseResponse> {
    #private;
    sections: ObservedArray<ItemSection>;
    feed_actions: BrowseFeedActions;
    constructor(actions: Actions, data: ApiResponse | IBrowseResponse, already_parsed?: boolean);
    /**
     * Whether watch history is currently paused.
     */
    get is_watch_history_paused(): boolean;
    /**
     * Pauses watch history, so that future videos are not recorded.
     * @returns `true` if YouTube processed the request.
     */
    pauseWatchHistory(): Promise<boolean>;
    /**
     * Resumes watch history.
     * @returns `true` if YouTube processed the request.
     */
    resumeWatchHistory(): Promise<boolean>;
    /**
     * Clears the entire watch history.
     * @returns `true` if YouTube processed the request.
     */
    clearWatchHistory(): Promise<boolean>;
    /**
     * Retrieves next batch of contents.
     */
    getContinuation(): Promise<History>;
    /**
     * Searches the watch history feed using the feed actions search box.
     * @param query - The search query.
     */
    search(query: string): Promise<History>;
    /**
     * Removes a video from watch history.
     * @returns `true` if YouTube processed the request.
     */
    removeVideo(video_id: string, pages_to_load?: number): Promise<boolean>;
}
