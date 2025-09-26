import { CreatureData } from "./creature.mjs";

const {
    StringField, NumberField, SchemaField, BooleanField, ArrayField, DocumentUUIDField
} = foundry.data.fields;

export class CharacterData extends CreatureData {
    static _abilitiesSchema() {
        const numberConfig = { required: true, min: 0, step: 1, initial: 0 };
        return Object.entries(CONFIG.SD.abilities)
            .reduce((obj, [k, v]) => (obj[k] = new NumberField({ ...numberConfig, label: `${v}.short` }), obj), {});
    }

    static _raceChoices() {
        return Object.entries(CONFIG.SD.races).reduce((obj, [k, v]) => (obj[k] = `SD.race.${k}`, obj), {});
    }

    static _alignmentChoices() {
        return CONFIG.SD.alignment.variants.reduce((obj, k) => (obj[k] = `SD.alignment.${k}`, obj), {});
    }

    static _classChoices() {
        return Object.entries(CONFIG.SD.classes).reduce((obj, [k, v]) => (obj[k] = `SD.class.${k}`, obj), {});
    }

    static _progressSchema() {
        const numberConfig = { required: true, step: 1 };
        return {
            xp: new NumberField({ ...numberConfig, label: "SD.progress.xp.current", min: 0, initial: 0 }),
            level: new NumberField({ ...numberConfig, label: "SD.progress.level", min: 1, max: CONFIG.SD.progress.max_level, initial: 1 }),
        };
    }

    static _splendorSchema() {
        const numberConfig = { required: true, min: 0, step: 1, initial: 0 };
        return {
            value: new NumberField({ ...numberConfig, label: "SD.splendor.name" }),
            reroll_used: new NumberField({ ...numberConfig, label: "SD.reroll.used", tooltip: "SD.reroll.used" }),
        };
    }

    static _survivalSchema() {
        const numberConfig = { required: true, min: 0, step: 1, initial: 0 };
        return {
            thirst: new SchemaField({
                current: new NumberField({ ...numberConfig, label: "SD.survival.thirst.current" }),
            }, { label: "SD.survival.thirst.name" }),
            hunger: new SchemaField({
                current: new NumberField({ ...numberConfig, label: "SD.survival.hunger.current" }),
            }, { label: "SD.survival.hunger.name" }),
        };
    }

    static _equipmentSchema() {
        return {
            weapon: new StringField({ label: "SD.equipment.slot.weapon" }),
            armor: new StringField({ label: "SD.equipment.slot.armor" }),
            shield: new StringField({ label: "SD.equipment.slot.shield" }),
        };
    }

    static _inventorySchema() {
        return {
            prepared: new ArrayField(new DocumentUUIDField(), { required: true, label: "SD.inventory.prepared.name" }),
            packed: new ArrayField(new DocumentUUIDField(), { required: true, label: "SD.inventory.packed.name" }),
        };
    }

    static defineSchema() {
        return {
            ...super.defineSchema(),
            abilities: new SchemaField(CharacterData._abilitiesSchema(), { label: "SD.ability.name" }),
            race: new StringField({ required: true, label: "SD.race.name", choices: CharacterData._raceChoices(), initial: Object.keys(CONFIG.SD.races)[0] }),
            alignment: new StringField({ required: true, label: "SD.alignment.name", choices: CharacterData._alignmentChoices(), initial: CONFIG.SD.alignment.variants[0] }),
            cls: new StringField({ required: true, label: "SD.class.name", choices: CharacterData._classChoices(), initial: Object.keys(CONFIG.SD.classes)[0] }),
            progress: new SchemaField(CharacterData._progressSchema()),
            splendor: new SchemaField(CharacterData._splendorSchema(), { label: "SD.splendor.name" }),
            survival: new SchemaField(CharacterData._survivalSchema(), { label: "SD.survival.name" }),
            inventory: new SchemaField(CharacterData._inventorySchema(), { label: "SD.inventory.name" }),
            equipment: new SchemaField(CharacterData._equipmentSchema(), { label: "SD.equipment.name" }),
        };
    }

    get _is_new() {
        return Object.entries(this.abilities).reduce((sum, [k, v]) => sum + v, 0) === 0;
    }

    get _class() {
        return CONFIG.SD.classes[this.cls];
    }

    bestAbilityMod(abilities) {
        if (!abilities) {
            return 0;
        }
        return Math.max(...abilities.map((ability) => (this.abilities_mod[ability])));
    }

    _prepareMainResources() {
        const manaAbilities = this._class.mana?.abilities;
        this.resources.mana.max = manaAbilities ? Math.max(1, 1 + this.progress.level + this.bestAbilityMod(manaAbilities)) : 0;
        const faithAbilities = this._class.faith?.abilities;
        this.resources.faith.max = faithAbilities ? Math.max(1, 1 + this.progress.level + this.bestAbilityMod(faithAbilities)) : 0;

        this.schema.fields.resources.fields.hp.fields.value.max = this.resources.hp.max ?? 0;
        this.schema.fields.resources.fields.mana.fields.value.max = this.resources.mana.max ?? 0;
        this.schema.fields.resources.fields.faith.fields.value.max = this.resources.faith.max ?? 0;
    }

    static _itemsWithType(items, type) {
        return items.reduce((obj, item) => (item.type === type ? (obj[item.id] = item.name) : null, obj), {});
    }

    static _currentEncumbrance(encumbrance, items_count) {
        return Object.entries(encumbrance).find(([k, v]) => items_count <= v)?.[0];
    }

    _prepareInventory() {
        const prepared_max = Math.floor(this.abilities.str / 2);
        const packed_max = this.abilities.str;
        this.schema.fields.inventory.fields.prepared.max = prepared_max;
        this.schema.fields.inventory.fields.packed.max = packed_max;

        const { prepared, packed } = Object.groupBy(this.parent.items, item => item.system.is_prepared ? "prepared" : "packed");

        this.schema.fields.equipment.fields.weapon.choices = CharacterData._itemsWithType(prepared, "weapon");
        this.schema.fields.equipment.fields.armor.choices = CharacterData._itemsWithType(prepared, "armor");
        this.schema.fields.equipment.fields.shield.choices = CharacterData._itemsWithType(prepared, "shield");

        this.inventory.prepared.items = prepared;
        this.inventory.prepared.count = prepared.length;
        this.inventory.prepared.encumbrance = {};
        this.inventory.prepared.encumbrance.no = prepared_max;
        this.inventory.prepared.encumbrance.light = prepared_max + CONFIG.SD.encumbrance.light.prepared;
        this.inventory.prepared.encumbrance.heavy = this.inventory.prepared.encumbrance.light + CONFIG.SD.encumbrance.heavy.prepared;
        this.inventory.prepared.encumbrance.current = CharacterData._currentEncumbrance(this.inventory.prepared.encumbrance, this.inventory.prepared.count);
        this.inventory.prepared.max = this.inventory.prepared.encumbrance.heavy;

        this.inventory.packed.items = packed;
        this.inventory.packed.count = packed.length;
        this.inventory.packed.encumbrance = {};
        this.inventory.packed.encumbrance.no = packed_max;
        this.inventory.packed.encumbrance.light = packed_max + CONFIG.SD.encumbrance.light.packed;
        this.inventory.packed.encumbrance.heavy = this.inventory.packed.encumbrance.light + CONFIG.SD.encumbrance.heavy.packed;
        this.inventory.packed.encumbrance.current = CharacterData._currentEncumbrance(this.inventory.packed.encumbrance, this.inventory.packed.count);
        this.inventory.packed.max = this.inventory.packed.encumbrance.heavy;
    }

    prepareDerivedData() {
        super.prepareDerivedData?.();

        this.is_new = this._is_new;
        this.progress.xp_next = CONFIG.SD.progress.xpToLevelUp(this.progress.level);
        this.progress.xp = Math.max(this.progress.xp, CONFIG.SD.progress.levelToXp(this.progress.level));
        this.abilities_mod = Object.entries(this.abilities).reduce((obj, [k, v]) => {
            obj[k] = CONFIG.SD.abilityToMod(v);
            return obj;
        }, {});
        this._prepareMainResources();
        this.saving_throws = Object.entries(CONFIG.SD.saving_throws).reduce((obj, [k, v]) => {
            const value = 15 - Math.floor(this.progress.level / 2);
            const abilities_mod = v.abilities.map((ability) => this.abilities_mod[ability]);
            const ability_mod = abilities_mod.length ? Math.max(...abilities_mod) : 0;
            // TODO: Armor penalty
            const armor_penalty = 0;
            obj[k] = value - ability_mod + armor_penalty;
            return obj;
        }, {});
        this.splendor.reroll_max = CONFIG.SD.splendorToMaxRerolls(this.splendor.value);
        this.initiative = this.abilities_mod[CONFIG.SD.initiative.ability];
        this.ac = {
            base: CONFIG.SD.ac.base,
            total: CONFIG.SD.ac.base,
        };
        this.survival.thirst.max = CONFIG.SD.survival.thirst.max;
        this.survival.hunger.max = CONFIG.SD.survival.hunger.max;
        this._prepareInventory();
    }
}
