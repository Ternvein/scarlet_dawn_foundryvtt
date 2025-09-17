import SD from "../config.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class ItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
    static DEFAULT_OPTIONS = {
        classes: ["sd", "sheet", "item"],
        position: {
            width: 650,
        },
        tag: "form",
        window: {
            icon: "fas fa-gear", // You can now add an icon to the header
            title: "SD.sheet.item.title",
            contentClasses: ["standard-form"],
        },
        form: {
            handler: ItemSheet.#submit,
            submitOnChange: true,
            closeOnSubmit: false
        }
    };

    static PARTS = {
        header: {
            template: `${SD.templatesPath}/items/item-header.html`,
        },
    };

    async _prepareContext(options) {
        console.log(this);
        const context = {
            ...await super._prepareContext(options),
            item: this.item,
            fields: this.item.system.schema.fields,
            system: this.item.system,
            config: CONFIG.SD,
        };
        return context;
    }

    static async #submit(event, form, formData, options = {}) {
        console.log(formData);
        if (!this.isEditable) return;
        const { updateData, ...updateOptions } = options;
        const submitData = this._prepareSubmitData(event, form, formData, updateData);
        await this._processSubmitData(event, form, submitData, updateOptions);
    }
}

