import MovementField from "./fields/movement.mjs";

const {
    HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;

/**
 * SD creature actor
 * @extends {Actor}
 */
export class CreatureData extends foundry.abstract.TypeDataModel {
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
