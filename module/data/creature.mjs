import MovementField from "./fields/movement.mjs";

const {
    HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;

/**
 * SD creature actor
 * @extends {Actor}
 */
export class CreatureData extends foundry.abstract.TypeDataModel {
    static _hpSchema() {
        const numberConfig = { required: true, min: 0, step: 1 };
        const max = this.hp?.max ?? 0;
        return {
            current: new NumberField({ ...numberConfig, label: "SD.hp.current", max, initial: max }),
            max: new NumberField({ ...numberConfig, label: "SD.hp.max", initial: 0 }),
        };
    }

    static _manaSchema() {
        const numberConfig = { required: true, min: 0, step: 1 };
        const max = this.mana?.max ?? 0;
        return {
            current: new NumberField({ ...numberConfig, label: "SD.mana.current", max, initial: max }),
            max: new NumberField({ ...numberConfig, label: "SD.mana.max", initial: 0 }),
        };
    }

    static _faithSchema() {
        const numberConfig = { required: true, min: 0, step: 1 };
        const max = this.faith?.max ?? 0;
        return {
            current: new NumberField({ ...numberConfig, label: "SD.faith.current", max, initial: max }),
            max: new NumberField({ ...numberConfig, label: "SD.faith.max", initial: 0 }),
        };
    }

    /**
     * Fields for creatures.
     *
     * @type {object}
     * @property {object} description                   Creature's description.
     * @property {object} description.biography         Creature's biography data.
     * @property {string} description.biography.full    Full HTML biography information.
     * @property {string} description.biography.public  Biography that will be displayed to players with observer privileges.
     * @property {string} race                          Creature's race.
     */
    static defineSchema() {
        return {
            hp: new SchemaField(CreatureData._hpSchema(), { label: "SD.hp.name" }),
            mana: new SchemaField(CreatureData._manaSchema(), { label: "SD.mana.name" }),
            faith: new SchemaField(CreatureData._faithSchema(), { label: "SD.faith.name" }),
            description: new SchemaField({
                biography: new SchemaField({
                    full: new HTMLField({ label: "SD.biography.full" }),
                    public: new HTMLField({ label: "SD.biography.public" })
                }, { label: "SD.biography.public" })
            }),
            movement: new MovementField()
        };
    }

    get land_only() {
        return !this.entries().some(([k, v]) => k !== "land" && v.value !== 0);
    }
}
