/**
  * @import * from "../../config.mjs";
  */

const { NumberField, StringField, SchemaField } = foundry.data.fields;

export default class DurationField extends SchemaField {
    constructor(options = {}, context = {}) {
        const units = Object.keys(CONFIG.SD.duration.units).reduce((obj, key) => (obj[key] = `SD.duration.units.${key}`, obj), {});
        const initial = Object.keys(CONFIG.SD.duration.units)?.[0];
        const fields = {
            value: new NumberField({ required: true, integer: true, positive: true, initial: 1, label: "SD.duration.value" }),
            unit: new StringField({ required: true, choices: units, initial: initial, label: "SD.duration.unit" }),
        };
        super(fields, { label: "SD.duration.name", ...options }, context);
    }
}
