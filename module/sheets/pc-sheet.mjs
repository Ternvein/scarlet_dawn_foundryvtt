import SD from "../config.mjs";
import SDActorSheet from "./base-actor-sheet.mjs";

export class PCSheet extends SDActorSheet {
    /** @override */
    static DEFAULT_OPTIONS = {
        actions: {
            roll: PCSheet.#roll,
            item: PCSheet.#item,
            trait: PCSheet.#trait,
            spell: PCSheet.#spell,
        },
        classes: ["sd", "sheet", "actor", "pc"],
        position: {
            width: 650,
        },
        tag: "form",
        window: {
            contentClasses: ["standard-form"],
        },
        form: {
            handler: PCSheet.#submit,
            submitOnChange: true,
            closeOnSubmit: false
        },
    };

    static PARTS = {
        header: {
            template: `${SD.templatesPath}/actors/pc/pc-header.html`,
        },
        tabs: {
            template: 'templates/generic/tab-navigation.hbs',
        },
        attributes: {
            template: `${SD.templatesPath}/actors/pc/pc-attributes-tab.html`,
            scrollable: [''],
        },
        traits: {
            template: `${SD.templatesPath}/actors/pc/pc-traits-tab.html`,
            scrollable: [''],
        },
        inventory: {
            template: `${SD.templatesPath}/actors/pc/pc-inventory-tab.html`,
            scrollable: [''],
        },
        spells: {
            template: `${SD.templatesPath}/actors/pc/pc-spells-tab.html`,
            scrollable: [''],
        },
        description: {
            template: `${SD.templatesPath}/actors/pc/pc-description-tab.html`,
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
                { id: "traits", icon: "fas fa-award", /*cssClass: "attributes-tab flexrow"*/ },
                { id: "inventory", icon: "fas fa-sack", /*cssClass: "attributes-tab flexrow"*/ },
                { id: "spells", icon: "fas fa-book-blank", /*cssClass: "attributes-tab flexrow"*/ },
                { id: "description", icon: "fas fa-scroll", /*cssClass: "attributes-tab flexrow"*/ },
            ],
            labelPrefix: "SD.sheet.pc.tab",
            initial: "attributes",
        }
    };

    /** @inheritDoc */
    async _prepareContext(options) {
        const context = {
            ...await super._prepareContext(options),
            actor: this.actor,
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
            case 'traits':
            case 'inventory':
            case 'spells':
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
            case "sheet":
                return this.actor.itemSheet(target.closest("[data-item-id]").dataset.itemId);
            case "prepare":
                return this.actor.itemPrepare(target.closest("[data-item-id]").dataset.itemId);
            case "pack":
                return this.actor.itemPack(target.closest("[data-item-id]").dataset.itemId);
            case "trash":
                return this.actor.itemTrash(target.closest("[data-item-id]").dataset.itemId);
            default:
                break;
        }
    }

    static #trait(event, target) {
        switch (target.dataset.type) {
            case "add":
                const data = { name: game.i18n.localize("SD.trait.name"), type: "trait" };
                return this.actor.itemCreate(data);
            case "delete":
                return this.actor.itemTrash(target.dataset.traitId);
            case "sheet":
                return this.actor.itemSheet(target.dataset.traitId);
            default:
                break;
        }
    }

    static #spell(event, target) {
        switch (target.dataset.type) {
            case "delete":
                return this.actor.itemTrash(target.dataset.spellId);
            case "sheet":
                return this.actor.itemSheet(target.dataset.spellId);
            default:
                break;
        }
    }

    /**
     * Process form submission for the sheet
     * @this {PCSheet}                      The handler is called with the application as its bound scope
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
