import { ItemSheet } from "./item-sheet.mjs";

export class OtherItemSheet extends ItemSheet {
    static DEFAULT_OPTIONS = {
        classes: ["other"],
        window: {
            subtitle: "SD.sheet.item.name",
        },
    };

    static PARTS = {
        ...super.PARTS,
        ...super.FOOTER,
    };
}
