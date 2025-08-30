import { SD } from "../config.mjs";

export class RollCharacter extends Roll {
    static CHAT_TEMPLATE = `${SD.templatesPath}/chat/rolls/roll_character.html`;
}
