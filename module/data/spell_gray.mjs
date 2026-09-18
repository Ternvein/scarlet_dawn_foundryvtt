import { SpellData } from "./spell.mjs";
import DurationField from "./fields/duration.mjs";

const {
    HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class SpellGrayData extends SpellData {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            level: new NumberField({ required: true, integer: true, min: 0, initial: 1, label: "SD.spell.types.gray.level" }),
            distance: new StringField({ required: true, label: "SD.spell.types.gray.distance" }),
            duration: new StringField({ required: true, label: "SD.spell.types.gray.duration" }),
            target: new StringField({ required: true, label: "SD.spell.types.gray.target" }),
            saving_throw: new StringField({ required: true, label: "SD.spell.types.gray.saving_throw" }),
        };
    }
}
