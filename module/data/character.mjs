import { CreatureData } from "./creature.mjs";

const {
    StringField, NumberField, SchemaField, BooleanField
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

    static defineSchema() {
        return {
            ...super.defineSchema(),
            abilities: new SchemaField(CharacterData._abilitiesSchema(), { label: "SD.ability.name" }),
            race: new StringField({ required: true, label: "SD.race.name", choices: CharacterData._raceChoices(), initial: Object.keys(CONFIG.SD.races)[0] }),
            alignment: new StringField({ required: true, label: "SD.alignment.name", choices: CharacterData._alignmentChoices(), initial: CONFIG.SD.alignment.variants[0] }),
            cls: new StringField({ required: true, label: "SD.class.name", choices: CharacterData._classChoices(), initial: Object.keys(CONFIG.SD.classes)[0] }),
            progress: new SchemaField(CharacterData._progressSchema()),
            splendor: new SchemaField(CharacterData._splendorSchema(), { label: "SD.splendor.name" }),
        };
    }

    get _isNew() {
        return Object.entries(this.abilities).reduce((sum, [k, v]) => sum + v, 0) === 0;
    }

    prepareDerivedData() {
        this.is_new = this._isNew;
        this.progress.xp_next = CONFIG.SD.progress.xpToLevelUp(this.progress.level);
        this.progress.xp = Math.max(this.progress.xp, CONFIG.SD.progress.levelToXp(this.progress.level));
        this.abilities_mod = Object.entries(this.abilities).reduce((obj, [k, v]) => {
            obj[k] = CONFIG.SD.abilityToMod(v);
            return obj;
        }, {});
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
    }
}
