import SD from "../config.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export class CharacterSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
    /** @override */
    static DEFAULT_OPTIONS = {
        actions: {
            roll: CharacterSheet.#roll,
            item: CharacterSheet.#item,
        },
        classes: ["sd", "sheet", "actor", "character"],
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
            handler: CharacterSheet.#submit,
            submitOnChange: true,
            closeOnSubmit: false
        },
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
            case "attack":
                return this.actor.rollAttack();
            case "weapon":
                return this.actor.weapon?.rollWeapon();
            case "initiative":
                return this.actor.rollInitiativeCheck();
            default:
                break;
        }
    }

    static #item(event, target) {
        switch (target.dataset.type) {
            case "prepare":
                return this.actor.itemPrepare(target.dataset.item);
            case "pack":
                return this.actor.itemPack(target.dataset.item);
            case "trash":
                return this.actor.itemTrash(target.dataset.item);
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

    /**
     * @param {DragEvent} event 
     */
    async _onEquipmentDropItem(event) {
        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
        const actor = this.actor;
        const allowed = Hooks.call("dropActorSheetData", actor, this, data);
        if (allowed === false) return;

        if (data.type === "Item") {
            const item = await foundry.utils.fromUuid(data.uuid);
            if (this.actor.isOwner && this.actor.uuid === item.parent?.uuid) {
                const target = event.currentTarget;
                if (["weapon", "armor", "shield"].includes(target.dataset.equipmentSlot) && target.dataset.equipmentSlot === item.type) {
                    this.actor.itemEquip(item.id, target.dataset.equipmentSlot);
                    return item;
                }
            }
        }
        return null;
    }

    async _onRender(context, options) {
        await super._onRender(context, options);
        new foundry.applications.ux.DragDrop.implementation({
            dropSelector: ".equipment .slot",
            permissions: {
                dragstart: () => false,
                drop: () => this.isEditable
            },
            callbacks: {
                drop: this._onEquipmentDropItem.bind(this)
            }
        }).bind(this.element);
    }
}
