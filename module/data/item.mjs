const {
    HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class ItemData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new HTMLField({ label: "SD.item.description" }),
            weight: new NumberField({ required: true, min: 0, step: 1, initial: 0, label: "SD.item.weight" }),
            price: new NumberField({ required: false, min: 0, initial: 0, label: "SD.item.price" }),
            is_prepared: new BooleanField({ required: true, initial: false, label: "SD.item.prepared" }),
        };
    }

    prepareDerivedData() {
        super.prepareDerivedData?.();
    }
}
