const { NumberField, SchemaField } = foundry.data.fields;

/**
 * @typedef {object} MovementData
 * @property {number} burrow  Actor burrowing speed.
 * @property {number} climb   Actor climbing speed.
 * @property {number} fly     Actor flying speed.
 * @property {number} swim    Actor swimming speed.
 * @property {number} land    Actor walking speed.
 */

/**
 * Field for storing movement data.
 */
export default class MovementField extends SchemaField {
    constructor(options = {}, context = {}) {
        const numberConfig = { required: true, min: 0, step: 1, initial: 0 };
        let fields = Object.entries(CONFIG.SD.movement_types)
            .reduce((obj, [k, v]) => (obj[k] = new NumberField({ ...numberConfig, label: v }), obj), {});
        //Object.entries(fields).forEach(([k, v]) => !v ? delete fields[k] : null);
        super(fields, { label: "SD.movement.name", ...options }, context);
    }
}
