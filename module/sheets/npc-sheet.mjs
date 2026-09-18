import SD from "../config.mjs";
import SDActorSheet from "./base-actor-sheet.mjs";

export class NPCSheet extends SDActorSheet {
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
        tabs: {
            template: 'templates/generic/tab-navigation.hbs',
        },
        attributes: {
            template: `${SD.templatesPath}/actors/npc/npc-attributes-tab.html`,
        },
        description: {
            template: `${SD.templatesPath}/actors/npc/npc-description-tab.html`,
        },
    };

    static TABS = {
        primary: {
            tabs: [
                { id: "attributes", icon: "fas fa-user", },
                { id: "description", icon: "fas fa-scroll", },
            ],
            labelPrefix: "SD.sheet.npc.tab",
            initial: "attributes",
        }
    };

    /** @inheritDoc */
    async _prepareContext(options) {
        const context = {
            ...await super._prepareContext(options),
            actor: this.actor,
        };
        return context;
    }

    async _preparePartContext(partId, context) {
        switch (partId) {
            case 'attributes':
            case 'description':
                context.tab = context.tabs[partId];
                break;
            default:
                break;
        }
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
        if (!this.isEditable) return;
        const { updateData, ...updateOptions } = options;
        const submitData = this._prepareSubmitData(event, form, formData, updateData);
        await this._processSubmitData(event, form, submitData, updateOptions);
    }
}
