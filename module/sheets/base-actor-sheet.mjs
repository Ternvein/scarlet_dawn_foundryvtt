import SD from "../config.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { TextEditor } = foundry.applications.ux;

export default class SDActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    get isEditable() {
        return super.isEditable && !(this.document.getFlag('scarlet-dawn', 'isEditLocked') ?? false);
    }

    async _prepareContext(options) {
        const context = {
            ...await super._prepareContext(options),
            fields: this.actor.system.schema.fields,
            system: this.actor.system,
            config: CONFIG.SD,
            enrichedDescription: await TextEditor.enrichHTML(this.actor.system.description ?? '', { async: true }),
        };
        return context;
    }
}
