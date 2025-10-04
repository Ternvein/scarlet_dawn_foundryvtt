import { ItemData } from "./item.mjs";

const {
    StringField, NumberField, SchemaField, BooleanField
} = foundry.data.fields;

export class ShieldData extends ItemData {
    static _acSchema() {
        return new SchemaField({
            value: new NumberField({ required: true, integer: true, min: 10, initial: 10, label: "SD.ac.full" }),
            is_standard: new BooleanField({ required: true, initial: true, label: "SD.ac.standard" }),
        });
    }

    static defineSchema() {
        return {
            ...super.defineSchema(),
            ac: ShieldData._acSchema(),
            enchantment: new NumberField({ required: true, integer: true, min: 0, initial: 0, label: "SD.item.enchantment" }),
        };
    }

    prepareDerivedData() {
        super.prepareDerivedData?.();
        this.is_enchanted = this.enchantment > 0;
        if (this.ac.is_standard) {
            this.ac.value = CONFIG.SD.shield.ac ?? CONFIG.SD.ac.base;
        }
        this.ac.bonus = CONFIG.SD.shield.bonus + this.enchantment;
        this.ac.total = this.ac.value + this.enchantment;
    }
}
