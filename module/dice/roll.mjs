import { SD } from "../config.mjs";

export class SDRoll extends Roll {
    static CHAT_TEMPLATE = `${SD.templatesPath}/chat/rolls/roll.html`;

    async _prepareChatRenderContext({ isPrivate = false, ...options } = {}) {
        const is_success = options.is_success ?? this.options.is_success;
        let css_success = null;
        if (is_success != null) {
            css_success = is_success ? "success" : "failure";
        }
        return {
            ...await super._prepareChatRenderContext(options),
            target: options.target ?? this.options.target,
            is_success,
            css_success,
            system: options.system ?? this.options.system,
        };
    }
}
