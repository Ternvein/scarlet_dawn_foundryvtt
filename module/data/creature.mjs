import MovementField from "./fields/movement.mjs";

const {
    HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;

export class CreatureData extends foundry.abstract.TypeDataModel {
    static _hpSchema() {
        const numberConfig = { required: true, min: 0, step: 1, initial: 0 };
        return {
            value: new NumberField({ ...numberConfig, label: "SD.resource.hp.value" }),
            max: new NumberField({ ...numberConfig, label: "SD.resource.hp.max" }),
        };
    }

    static _manaSchema() {
        const numberConfig = { required: true, min: 0, step: 1 };
        const max = this.mana?.max ?? 0;
        return {
            value: new NumberField({ ...numberConfig, label: "SD.resource.mana.value", max, initial: max }),
            max: new NumberField({ ...numberConfig, label: "SD.resource.mana.max", initial: 0 }),
        };
    }

    static _faithSchema() {
        const numberConfig = { required: true, min: 0, step: 1 };
        const max = this.faith?.max ?? 0;
        return {
            value: new NumberField({ ...numberConfig, label: "SD.resource.faith.value", max, initial: max }),
            max: new NumberField({ ...numberConfig, label: "SD.resource.faith.max", initial: 0 }),
        };
    }

    static _mainResourcesSchema() {
        return {
            hp: new SchemaField(CreatureData._hpSchema(), { label: "SD.resource.hp.name" }),
            mana: new SchemaField(CreatureData._manaSchema(), { label: "SD.resource.mana.name" }),
            faith: new SchemaField(CreatureData._faithSchema(), { label: "SD.resource.faith.name" }),
        };
    }

    static defineSchema() {
        return {
            resources: new SchemaField(CreatureData._mainResourcesSchema(), { label: "SD.resource.name" }),
            description: new HTMLField({ label: "SD.details.description" }),
            movement: new MovementField()
        };
    }

    prepareDerivedData() {
        super.prepareDerivedData?.();
    }

    get land_only() {
        return !this.entries().some(([k, v]) => k !== "land" && v.value !== 0);
    }
}
