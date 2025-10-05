import { ItemData } from "./item.mjs";

const {
    StringField, NumberField, SchemaField, BooleanField
} = foundry.data.fields;

export class WeaponData extends ItemData {
    static _categorySchema() {
        const choices = Object.keys(CONFIG.SD.weapon.categories).reduce((obj, k) => (obj[k] = `SD.item.weapon.category.${k}`, obj), {});
        const initial = Object.keys(CONFIG.SD.weapon.categories)?.[0];
        return new StringField({ required: true, label: "SD.item.weapon.category.name", choices, initial });
    }

    static _damageSchema() {
        return new StringField({ required: true, initial: "1d6", label: "SD.item.weapon.damage.name", validate: WeaponData._damageValidator, validationError: game.i18n.localize("SD.item.weapon.damage.error") });
    }

    static _damageValidator(value, options) {
        return Roll.validate(value);
    }

    static defineSchema() {
        return {
            ...super.defineSchema(),
            category: WeaponData._categorySchema(),
            damage: WeaponData._damageSchema(),
            standard_damage: new BooleanField({ required: true, initial: true, label: "SD.item.weapon.damage.standard" }),
            enchantment: new NumberField({ required: true, integer: true, min: 0, initial: 0, label: "SD.item.enchantment" }),
            attack_bonus: new NumberField({ required: true, integer: true, step: 1, initial: 0, label: "SD.item.weapon.attack_bonus" }),
            range: new NumberField({ min: 0, step: 1, label: "SD.item.weapon.range" }),
        };
    }

    _categoryData() {
        return CONFIG.SD.weapon.categories[this.category];
    }

    prepareBaseData() {
        super.prepareBaseData?.();
        this.is_equippable = true;
    }

    prepareDerivedData() {
        super.prepareDerivedData?.();
        this.is_ranged = this._categoryData()?.ranged ?? false;
        this.is_enchanted = this.enchantment > 0;
        if (this.standard_damage) {
            this.damage = this._categoryData().damage;
        }
    }
}
