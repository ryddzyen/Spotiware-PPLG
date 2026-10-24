import { YTNode } from '../helpers.js';
import { type RawNode } from '../index.js';
import RendererContext from './misc/RendererContext.js';
import NavigationEndpoint from './NavigationEndpoint.js';
import LiveStreamOfflineSlate from './LiveStreamOfflineSlate.js';
export default class LiveStreamability extends YTNode {
    static type: string;
    video_id: string;
    broadcast_id?: string;
    stream_transition_endpoint?: NavigationEndpoint;
    switch_streams_immediately?: boolean;
    display_endscreen?: boolean;
    poll_delay_ms?: string;
    creator_redirect?: {
        hide_autoplay_toggle?: boolean;
    };
    transition_timing?: 'STREAM_TRANSITION_TIMING_UNSPECIFIED' | 'STREAM_TRANSITION_TIMING_AT_HEAD' | 'STREAM_TRANSITION_TIMING_IMMEDIATELY' | 'STREAM_TRANSITION_TIMING_AT_STREAM_END';
    offline_slate: LiveStreamOfflineSlate | null;
    renderer_context?: RendererContext;
    constructor(data: RawNode);
}
