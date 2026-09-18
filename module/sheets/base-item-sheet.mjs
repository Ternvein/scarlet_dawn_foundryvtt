import SD from "../config.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { TextEditor } = foundry.applications.ux;

export default class SDItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
    get isEditable() {
        return super.isEditable && !(this.document.getFlag('scarlet-dawn', 'isEditLocked') ?? false);
    }

    async _prepareContext(options) {
        const context = {
            ...await super._prepareContext(options),
            fields: this.item.system.schema.fields,
            system: this.item.system,
            config: CONFIG.SD,
            enrichedDescription: await TextEditor.enrichHTML(this.item.system.description ?? '', { async: true }),
        };
        return context;
    }
}
