import { ItemData } from "./item.mjs";

const {
    StringField, NumberField, SchemaField, BooleanField
} = foundry.data.fields;

export class ArmorData extends ItemData {
    static _categorySchema() {
        const choices = Object.keys(CONFIG.SD.armor.types).reduce((obj, k) => (obj[k] = `SD.item.armor.category.${k}`, obj), {});
        const initial = Object.keys(CONFIG.SD.armor.types)?.[0];
        return new StringField({ required: true, label: "SD.item.armor.category.name", choices, initial });
    }

    static _acSchema() {
        return new SchemaField({
            value: new NumberField({ required: true, integer: true, min: 10, initial: 10, label: "SD.ac.full" }),
            is_standard: new BooleanField({ required: true, initial: true, label: "SD.ac.standard" }),
        });
    }

    static _penaltiesSchema() {
        const types = Object.entries(CONFIG.SD.saving_throws.types)
            .filter(([k, v]) => v.armor_penalty)
            .reduce((obj, [k, v]) => (obj[k] = new BooleanField({ required: true, initial: false, label: v.label }), obj), {});
        return new SchemaField({ types: new SchemaField(types, { label: "SD.item.armor.penalty.name" }) }, { label: "SD.item.armor.penalty.name" });
    }

    static defineSchema() {
        return {
            ...super.defineSchema(),
            category: ArmorData._categorySchema(),
            ac: ArmorData._acSchema(),
            enchantment: new NumberField({ required: true, integer: true, min: 0, initial: 0, label: "SD.item.enchantment" }),
            penalties: this._penaltiesSchema(),
        };
    }

    get _categoryData() {
        return CONFIG.SD.armor.types[this.category];
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

        this.penalties.list = Object.entries(this.penalties.types).reduce((arr, [k, v]) => (v ? [...arr, k] : arr), []);
        this.penalties.remaining = (this._categoryData?.st_penalty ?? 0) - this.penalties.list.length;
    }
}
