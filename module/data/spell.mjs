import DurationField from "./fields/duration.mjs";

const {
    HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class SpellData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new HTMLField({ label: "SD.details.description" }),
            casting_time: new DurationField({ required: true, label: "SD.spell.casting_time" }),
        };
    }

    prepareDerivedData() {
        super.prepareDerivedData?.();
        this.is_spell = true;
        this.casting_time.is_adjustable = CONFIG.SD.duration.units[this.casting_time.unit] >= CONFIG.SD.duration.adjustable_threshold;
    }
}
