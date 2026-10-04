const {
    HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField, BooleanField
} = foundry.data.fields;

export class ItemData extends foundry.abstract.TypeDataModel {
    static _weightSchema() {
        return new SchemaField({
            carry: new NumberField({ required: true, min: 0, step: 1, initial: 0, label: "SD.item.weight.carry" }),
            equip: new NumberField({ required: true, min: 0, step: 1, initial: 0, label: "SD.item.weight.equip" }),
            is_standard: new BooleanField({ required: true, initial: true, label: "SD.item.weight.standard" }),
        }, { label: "SD.item.weight.name" });
    }

    static _splendorSchema() {
        return new SchemaField({
            value: new NumberField({ required: true, min: 0, integer: true, initial: 0, label: "SD.item.splendor.value" }),
            is_standard: new BooleanField({ required: true, initial: true, label: "SD.item.splendor.standard" }),
        }, { label: "SD.item.splendor.name" });
    }

    static defineSchema() {
        return {
            description: new HTMLField({ label: "SD.details.description" }),
            weight: ItemData._weightSchema(),
            price: new NumberField({ required: false, min: 0, initial: 0, label: "SD.item.price" }),
            splendor: ItemData._splendorSchema(),
            is_prepared: new BooleanField({ required: true, initial: false, label: "SD.item.prepared" }),
        };
    }

    prepareDerivedData() {
        super.prepareDerivedData?.();
        this.is_item = true;
        if (!this.weight.has_standard) {
            this.weight.is_standard = false;
        }
        if (this.splendor.is_standard) {
            this.splendor.value = CONFIG.SD.priceToSplendor(this.price);
        }
    }
}
