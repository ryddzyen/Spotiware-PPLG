import { YTNode } from '../helpers.js';
import { Parser } from '../index.js';
import RendererContext from './misc/RendererContext.js';
import NavigationEndpoint from './NavigationEndpoint.js';
import LiveStreamOfflineSlate from './LiveStreamOfflineSlate.js';
export default class LiveStreamability extends YTNode {
    static type = 'LiveStreamability';
    video_id;
    broadcast_id;
    stream_transition_endpoint;
    switch_streams_immediately;
    display_endscreen;
    poll_delay_ms;
    creator_redirect;
    transition_timing;
    offline_slate;
    renderer_context;
    constructor(data) {
        super();
        this.video_id = data.videoId;
        this.broadcast_id = data.broadcastId;
        this.transition_timing = data.transitionTiming;
        this.offline_slate = Parser.parseItem(data.offlineSlate, LiveStreamOfflineSlate);
        if ('pollDelayMs' in data) {
            this.poll_delay_ms = data.pollDelayMs;
        }
        if ('switchStreamsImmediately' in data) {
            this.switch_streams_immediately = data.switchStreamsImmediately;
        }
        if ('displayEndscreen' in data) {
            this.display_endscreen = data.displayEndscreen;
        }
        if ('streamTransitionEndpoint' in data) {
            this.stream_transition_endpoint = new NavigationEndpoint(data.streamTransitionEndpoint);
        }
        if ('creatorRedirect' in data) {
            this.creator_redirect = {
                hide_autoplay_toggle: data.creatorRedirect?.hideAutoplayToggle
            };
        }
        if ('rendererContext' in data) {
            this.renderer_context = new RendererContext(data.rendererContext);
        }
    }
}
//# sourceMappingURL=LiveStreamability.js.map