import SD from "../config.mjs";
import { ItemSheet } from "./item-sheet.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

export class ArmorSheet extends ItemSheet {
    static DEFAULT_OPTIONS = {
        actions: {
            roll: ArmorSheet.#roll,
        },
        classes: ["armor"],
        window: {
            subtitle: "SD.sheet.item.armor.name",
        },
    };

    static PARTS = {
        ...super.PARTS,
        armor: {
            template: `${SD.templatesPath}/items/armor-attributes.html`,
        },
    };

    static #roll(event, target) { }
}
