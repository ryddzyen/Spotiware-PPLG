import { YTNode } from '../../helpers.js';
const API_PATH = 'feedback';
export default class FeedbackEndpoint extends YTNode {
    static type = 'FeedbackEndpoint';
    #data;
    constructor(data) {
        super();
        this.#data = data;
    }
    getApiPath() {
        return API_PATH;
    }
    buildRequest() {
        const request = {};
        request.feedbackTokens = [];
        if (this.#data.feedbackToken)
            request.feedbackTokens.push(this.#data.feedbackToken);
        if (this.#data.cpn)
            request.feedbackContext = { cpn: this.#data.cpn };
        request.shouldMerge = !!this.#data.shouldMerge;
        // @NOTE: extraFeedbackTokens and isFeedbackTokenUnencrypted are both client-side properties.
        request.isFeedbackTokenUnencrypted = !!this.#data.isFeedbackTokenUnencrypted;
        if (this.#data.extraFeedbackTokens) {
            request.shouldMerge = true;
            request.feedbackTokens.push(...this.#data.extraFeedbackTokens);
        }
        return request;
    }
}
//# sourceMappingURL=FeedbackEndpoint.js.map