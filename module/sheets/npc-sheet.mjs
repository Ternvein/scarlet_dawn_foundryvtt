import SD from "../config.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class NPCSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        actions: {
            roll: NPCSheet.#roll,
            attack: NPCSheet.#attack,
        },
        classes: ["sd", "sheet", "actor", "npc"],
        position: {
            width: 650,
        },
        tag: "form",
        window: {
            //icon: "fas fa-gear", // You can now add an icon to the header
            //title: "SD.sheet.character.title",
            contentClasses: ["standard-form"],
        },
        form: {
            handler: NPCSheet.#submit,
            submitOnChange: true,
            closeOnSubmit: false
        },
    };

    static PARTS = {
        header: {
            template: `${SD.templatesPath}/actors/npc/npc-header.html`,
        },
        attributes: {
            template: `${SD.templatesPath}/actors/npc/npc-attributes.html`,
        },
    };

    /** @inheritDoc */
    async _prepareContext(options) {
        console.log(this);
        const context = {
            ...await super._prepareContext(options),
            actor: this.actor,
            fields: this.actor.system.schema.fields,
            system: this.actor.system,
            config: CONFIG.SD,
        };
        return context;
    }

    static #roll(event, target) {
        switch (target.dataset.type) {
            case "hp":
                return this.actor.rollMaxHp();
            case "saving-throw":
                return this.actor.rollSavingThrowCheck(target.dataset.st);
            case "attack":
                return this.actor.rollNpcAttack(target.dataset.attackIdx);
            default:
                break;
        }
    }

    static #attack(event, target) {
        switch (target.dataset.type) {
            case "add":
                return this.actor.npcAttackAdd();
            case "trash":
                return this.actor.npcAttackTrash(target.dataset.attackIdx);
            default:
                break;
        }
    }

    /**
     * Process form submission for the sheet
     * @this {NPCSheet}                             The handler is called with the application as its bound scope
     * @param {SubmitEvent} event                   The originating form submission event
     * @param {HTMLFormElement} form                The form element that was submitted
     * @param {FormDataExtended} formData           Processed data for the submitted form
     * @returns {Promise<void>}
     */
    static async #submit(event, form, formData, options = {}) {
        console.log(formData);
        if (!this.isEditable) return;
        const { updateData, ...updateOptions } = options;
        const submitData = this._prepareSubmitData(event, form, formData, updateData);
        await this._processSubmitData(event, form, submitData, updateOptions);
    }
}
