import SD from "../config.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class CharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        actions: {
            roll: CharacterSheet.#roll,
        },
        classes: ["sd", "sheet", "actor", "character"],
        position: {
            width: 600,
        },
        tag: "form",
        window: {
            icon: "fas fa-gear", // You can now add an icon to the header
            title: "SD.sheet.character.title",
            contentClasses: ["standard-form"],
        },
        form: {
            handler: CharacterSheet.#submit,
            submitOnChange: true,
            closeOnSubmit: false
        }
        //tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }],
        //scrollY: [".biography", ".inventory"],
        //dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
    };

    static PARTS = {
        header: {
            template: `${SD.templatesPath}/actors/character/character-header.html`,
        },
        tabs: {
            template: 'templates/generic/tab-navigation.hbs',
        },
        attributes: {
            template: `${SD.templatesPath}/actors/character/character-attributes-tab.html`,
            scrollable: [''],
        },
        inventory: {
            template: `${SD.templatesPath}/actors/character/character-inventory-tab.html`,
            scrollable: [''],
        },
        /*
        footer: {
            template: "templates/generic/form-footer.hbs",
        },
        */
    };

    static TABS = {
        primary: {
            tabs: [
                { id: "attributes", icon: "fas fa-user", /*cssClass: "attributes-tab flexrow"*/ },
                { id: "inventory", icon: "fas fa-table-list", /*cssClass: "attributes-tab flexrow"*/ },
            ],
            labelPrefix: "SD.sheet.character.tab",
            initial: "attributes",
        }
    };

    get title() {
        return `${this.actor.name}: ${game.i18n.localize(this.options.window.title)}`;
    }

    /** @inheritDoc */
    async _prepareContext(options) {
        console.log(this);
        const context = {
            ...await super._prepareContext(options),
            actor: this.actor,
            fields: this.actor.system.schema.fields,
            system: this.actor.system,
            config: CONFIG.SD,
            tabs: this._prepareTabs("primary"),
            /*
            buttons: [
                { type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" }
            ],
            */
        };
        return context;
    }

    async _preparePartContext(partId, context) {
        switch (partId) {
            case 'attributes':
            case 'inventory':
                context.tab = context.tabs[partId];
                break;
            default:
                break;
        }
        return context;
    }

    static #roll(event, target) {
        switch (target.dataset.type) {
            case "abilities":
                return this.actor.rollAbilities();
            case "hp":
                return this.actor.rollMaxHp();
            case "ability":
                return this.actor.rollAbilityCheck(target.dataset.ability);
            case "saving-throw":
                return this.actor.rollSavingThrowCheck(target.dataset.st);
            case "initiative":
                return this.actor.rollInitiativeCheck();
            default:
                break;
        }
    }

    /**
     * Process form submission for the sheet
     * @this {CharacterSheet}                      The handler is called with the application as its bound scope
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
