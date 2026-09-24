import { SD } from "./module/config.mjs";
import { SDRoll } from "./module/dice/roll.mjs";
import { SDActor } from "./module/documents/actor.mjs";
import { SDItem } from "./module/documents/item.mjs";
import { PlayerCharacterData } from "./module/data/pc.mjs";
import { NonPlayerCharacterData } from "./module/data/npc.mjs";
import { ItemData } from "./module/data/item.mjs";
import { WeaponData } from "./module/data/weapon.mjs";
import { ArmorData } from "./module/data/armor.mjs";
import { ShieldData } from "./module/data/shield.mjs";
import { TraitData } from "./module/data/trait.mjs";
import { SpellOriginalData } from "./module/data/spell_original.mjs";
import { SpellGrayData } from "./module/data/spell_gray.mjs";
import { PCSheet } from "./module/sheets/pc-sheet.mjs";
import { NPCSheet } from "./module/sheets/npc-sheet.mjs";
import { WeaponSheet } from "./module/sheets/weapon-sheet.mjs";
import { ArmorSheet } from "./module/sheets/armor-sheet.mjs";
import { ShieldSheet } from "./module/sheets/shield-sheet.mjs";
import { TraitSheet } from "./module/sheets/trait-sheet.mjs";
import { SpellOriginalSheet } from "./module/sheets/spell-original-sheet.mjs";
import { SpellGraySheet } from "./module/sheets/spell-gray-sheet.mjs";
import { OtherItemSheet } from "./module/sheets/other-item-sheet.mjs";
import { registerHelpers as handlebarsHelpers } from "./module/helpers/handlebars.mjs";
import { preloadTemplates } from "./module/helpers/templates.mjs";

import SDActorSheet from "./module/sheets/base-actor-sheet.mjs";
import SDItemSheet from "./module/sheets/base-item-sheet.mjs";

const { Actors, Items } = foundry.documents.collections;
const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;

Hooks.once("init", async () => {
    CONFIG.SD = SD;
    CONFIG.debug = {
        ...CONFIG.debug,
        combat: true,
    };

    CONFIG.Actor.documentClass = SDActor;
    CONFIG.Actor.dataModels = {
        character: PlayerCharacterData,
        npc: NonPlayerCharacterData,
    };

    CONFIG.Item.documentClass = SDItem;
    CONFIG.Item.typeIcons = CONFIG.SD.item.icons;
    CONFIG.Item.dataModels = {
        weapon: WeaponData,
        armor: ArmorData,
        shield: ShieldData,
        trait: TraitData,
        spell_original: SpellOriginalData,
        spell_gray: SpellGrayData,
        other: ItemData,
    };

    CONFIG.Dice.rolls.push(SDRoll);

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheetV2);
    Actors.registerSheet(game.system.id, PCSheet, {
        types: ["character"],
        makeDefault: true,
        label: "SD.sheet.character.name",
    });
    Actors.registerSheet(game.system.id, NPCSheet, {
        types: ["npc"],
        makeDefault: true,
        label: "SD.sheet.npc.name",
    });

    Items.unregisterSheet("core", ItemSheetV2);
    Items.registerSheet(game.system.id, WeaponSheet, {
        types: ["weapon"],
        makeDefault: true,
        label: "SD.sheet.item.weapon.name",
    });
    Items.registerSheet(game.system.id, ArmorSheet, {
        types: ["armor"],
        makeDefault: true,
        label: "SD.sheet.item.armor.name",
    });
    Items.registerSheet(game.system.id, ShieldSheet, {
        types: ["shield"],
        makeDefault: true,
        label: "SD.sheet.item.shield.name",
    });
    Items.registerSheet(game.system.id, TraitSheet, {
        types: ["trait"],
        makeDefault: true,
        label: "SD.sheet.trait.name",
    });
    Items.registerSheet(game.system.id, SpellOriginalSheet, {
        types: ["spell_original"],
        makeDefault: true,
        label: "SD.sheet.spell.original.name",
    });
    Items.registerSheet(game.system.id, SpellGraySheet, {
        types: ["spell_gray"],
        makeDefault: true,
        label: "SD.sheet.spell.gray.name",
    });
    Items.registerSheet(game.system.id, OtherItemSheet, {
        types: ["other"],
        makeDefault: true,
        label: "SD.sheet.item.name",
    });

    handlebarsHelpers();
    await preloadTemplates();
});

/**
 * This function runs after game data has been requested and loaded from the servers, so entities exist
 */
Hooks.once("setup", () => {
    // Localize CONFIG objects once up-front
    ["abilities"].forEach(
        (o) => {
            CONFIG.SD[o] = Object.entries(CONFIG.SD[o]).reduce((obj, [k, v]) => {
                const localized = { ...obj };
                localized[k] = game.i18n.localize(v);
                return localized;
            }, {});
        }
    );
});

Hooks.on('getHeaderControlsApplicationV2', (app, controls) => {
  if (!(app instanceof SDActorSheet) && !(app instanceof SDItemSheet)) {
      return;
  }

  controls.push({
    label: 'Переключить редактирование',
    icon: 'fas fa-lock',
    onClick: () => {
        const doc = app.document;
        if (!doc) {
            return;
        }

        const currentState = doc.getFlag('scarlet-dawn', 'isEditLocked') ?? false;
        const newState = !currentState;
        
        doc.setFlag('scarlet-dawn', 'isEditLocked', newState);

        app.render(false);
    }
  });
});
