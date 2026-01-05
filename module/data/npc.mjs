import { CreatureData } from "./creature.mjs";

const {
    StringField, NumberField, SchemaField, BooleanField, ArrayField, DocumentUUIDField
} = foundry.data.fields;

export class NonPlayerCharacterData extends CreatureData {
    static _attacksSchema() {
        return new ArrayField(new SchemaField({
            name: new StringField({ required: true, initial: game.i18n.localize("SD.attack"), label: "SD.attack" }),
            attack: new NumberField({ required: true, step: 1, initial: 0, label: "SD.attack_bonus.short", tooltip: "SD.attack_bonus.full" }),
            damage: new StringField({ required: true, initial: "1d6", label: "SD.damage", validate: NonPlayerCharacterData._damageValidator, validationError: game.i18n.localize("SD.npc.attacks.damage.error") }),
        }, { required: true }), { required: true, label: "SD.npc.attacks.name" });
    }

    static _damageValidator(value, options) {
        return Roll.validate(value);
    }

    static defineSchema() {
        return {
            ...super.defineSchema(),
            hd: new NumberField({ required: true, min: 1, step: 1, initial: 1, label: "SD.hd.short", tooltip: "SD.hd.full" }),
            ac: new NumberField({ required: true, min: CONFIG.SD.ac.min, step: 1, initial: CONFIG.SD.ac.min, label: "SD.ac.short", tooltip: "SD.ac.full" }),
            st: new NumberField({ required: true, min: 1, step: 1, initial: CONFIG.SD.saving_throws.base, label: "SD.st.short", tooltip: "SD.st.full" }),
            skill: new NumberField({ required: true, min: 0, step: 1, initial: 0, label: "SD.skill" }),
            morale: new NumberField({ required: true, min: CONFIG.SD.morale.min, max: CONFIG.SD.morale.max, step: 1, initial: CONFIG.SD.morale.base, label: "SD.morale.short", tooltip: "SD.morale.full" }),
            attacks: NonPlayerCharacterData._attacksSchema(),
        };
    }

    prepareDerivedData() {
        super.prepareDerivedData?.();
    }
}
