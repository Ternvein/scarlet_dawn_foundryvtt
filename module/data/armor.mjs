import { ItemData } from "./item.mjs";

const {
    StringField, NumberField, SchemaField, BooleanField
} = foundry.data.fields;

export class ArmorData extends ItemData {
    static _categorySchema() {
        const choices = Object.keys(CONFIG.SD.armor).reduce((obj, k) => (obj[k] = `SD.item.armor.category.${k}`, obj), {});
        const initial = Object.keys(CONFIG.SD.armor)?.[0];
        return new StringField({ required: true, label: "SD.item.armor.category.name", choices, initial });
    }

    static _acSchema() {
        return new SchemaField({
            value: new NumberField({ required: true, integer: true, min: 10, initial: 10, label: "SD.ac.full" }),
            is_standard: new BooleanField({ required: true, initial: true, label: "SD.ac.standard" }),
        });
    }

    static defineSchema() {
        return {
            ...super.defineSchema(),
            category: ArmorData._categorySchema(),
            ac: ArmorData._acSchema(),
            enchantment: new NumberField({ required: true, integer: true, min: 0, initial: 0, label: "SD.item.enchantment" }),
        };
    }

    get _categoryData() {
        return CONFIG.SD.armor[this.category];
    }

    prepareBaseData() {
        super.prepareBaseData?.();
        this.is_equippable = true;
        this.weight.has_standard = true;
    }

    prepareDerivedData() {
        super.prepareDerivedData?.();
        this.is_enchanted = this.enchantment > 0;
        if (this.weight.is_standard) {
            this.weight.carry = this._categoryData?.weight.carry ?? 0;
            this.weight.equip = this._categoryData?.weight.equip ?? 0;
        }
        if (this.ac.is_standard) {
            this.ac.value = this._categoryData?.ac ?? CONFIG.SD.ac.base;
        }
        this.ac.total = this.ac.value + this.enchantment;
    }
}
