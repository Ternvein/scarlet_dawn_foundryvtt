import { SpellData } from "./spell.mjs";

const {
    HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class SpellOriginalData extends SpellData {
    static _levelSchema() {
        const choices = Object.keys(CONFIG.SD.spell.original.level).reduce((obj, key) => (obj[key] = `SD.spell.types.original.level.${key}`, obj), {});
        const initial = Object.keys(CONFIG.SD.spell.original.level)?.[0];
        return new StringField({ required: true, choices, initial, label: "SD.spell.types.original.level.name" });
    }

    static defineSchema() {
        return {
            ...super.defineSchema(),
            level: SpellOriginalData._levelSchema(),
            points: new NumberField({ required: true, integer: true, min: 0, initial: 1, label: "SD.spell.types.original.points" }),
        };
    }
}
