import SD from "../config.mjs";
import { ItemSheet } from "./item-sheet.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;

export class WeaponSheet extends ItemSheet {
    static DEFAULT_OPTIONS = {
        actions: {
            roll: WeaponSheet.#roll,
        },
        classes: ["weapon"],
        window: {
            subtitle: "SD.sheet.item.weapon.title",
        },
    };

    static PARTS = {
        ...super.PARTS,
        weapon: {
            template: `${SD.templatesPath}/items/weapon-attributes.html`,
        },
    };

    static #roll(event, target) { }
}
