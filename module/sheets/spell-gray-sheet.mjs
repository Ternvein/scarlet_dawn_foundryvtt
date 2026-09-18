import SD from "../config.mjs";
import SDItemSheet from "./base-item-sheet.mjs";

export class SpellGraySheet extends SDItemSheet {
    static DEFAULT_OPTIONS = {
        classes: ["sd", "sheet", "spell", "gray"],
        position: {
            width: 650,
        },
        tag: "form",
        window: {
            icon: "fas fa-award",
            title: "SD.sheet.spell.gray.title",
            contentClasses: ["standard-form"],
        },
        form: {
            handler: SpellGraySheet.#submit,
            submitOnChange: true,
            closeOnSubmit: false
        }
    };

    static PARTS = {
        header: {
            template: `${SD.templatesPath}/spells/spell-gray-header.html`,
        },
        armor: {
            template: `${SD.templatesPath}/spells/spell-attributes.html`,
        },
    };

    async _prepareContext(options) {
        const context = {
            ...await super._prepareContext(options),
            spell: this.item,
        };
        return context;
    }

    static async #submit(event, form, formData, options = {}) {
        if (!this.isEditable) return;
        const { updateData, ...updateOptions } = options;
        const submitData = this._prepareSubmitData(event, form, formData, updateData);
        await this._processSubmitData(event, form, submitData, updateOptions);
    }
}
