const {
    HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class TraitData extends foundry.abstract.TypeDataModel {
    static _autoLevelSchema() {
        const numberConfig = { required: true, integer: true, positive: true };
        return new SchemaField({
            is_enabled: new BooleanField({ required: true, initial: false, label: "SD.trait.auto_level.name" }),
            base: new NumberField({ ...numberConfig, initial: 1, label: "SD.trait.auto_level.base" }),
            rate: new SchemaField({
                level: new NumberField({ ...numberConfig, initial: 2, label: "SD.trait.auto_level.rate.level" }),
                remainder: new NumberField({ ...numberConfig, initial: 1, label: "SD.trait.auto_level.rate.remainder" }),
            }, { label: "SD.trait.auto_level.rate.name" }),
        }, { label: "SD.trait.auto_level.name" });
    }

    static defineSchema() {
        const types = Object.entries(CONFIG.SD.trait.types).reduce((obj, [k, v]) => (obj[k] = game.i18n.localize(`${v.label}.name`), obj), {});
        return {
            description: new HTMLField({ label: "SD.trait.description" }),
            type: new StringField({ required: true, choices: types, initial: CONFIG.SD.trait.default, label: "SD.trait.type" }),
            level: new NumberField({ required: true, integer: true, positive: true, initial: 1, label: "SD.trait.level" }),
            auto_level: TraitData._autoLevelSchema(),
        };
    }

    prepareDerivedData() {
        super.prepareDerivedData?.();
        this.is_trait = true;
    }
}
