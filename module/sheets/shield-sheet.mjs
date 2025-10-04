import SD from "../config.mjs";
import { ItemSheet } from "./item-sheet.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

export class ShieldSheet extends ItemSheet {
    static DEFAULT_OPTIONS = {
        actions: {
            roll: ShieldSheet.#roll,
        },
        classes: ["shield"],
        window: {
            subtitle: "SD.sheet.item.shield.name",
        },
    };

    static PARTS = {
        ...super.PARTS,
        shield: {
            template: `${SD.templatesPath}/items/shield-attributes.html`,
        },
    };

    static #roll(event, target) { }
}
