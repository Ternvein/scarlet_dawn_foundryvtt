import { SD } from "./module/config.mjs";
import { SDRoll } from "./module/dice/roll.mjs";
import { RollCharacter } from "./module/dice/roll_character.mjs";
import { SDActor } from "./module/documents/actor.mjs";
import { SDItem } from "./module/documents/item.mjs";
import { CharacterData } from "./module/data/character.mjs";
import { WeaponData } from "./module/data/weapon.mjs";
import { ArmorData } from "./module/data/armor.mjs";
import { CharacterSheet } from "./module/sheets/character-sheet.mjs";
import { WeaponSheet } from "./module/sheets/weapon-sheet.mjs";
import { ArmorSheet } from "./module/sheets/armor-sheet.mjs";
import { registerHelpers as handlebarsHelpers } from "./module/helpers/handlebars.mjs";
import { preloadTemplates } from "./module/helpers/templates.mjs";

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
        character: CharacterData,
    };

    CONFIG.Item.documentClass = SDItem;
    CONFIG.Item.typeIcons = CONFIG.SD.item.icons;
    CONFIG.Item.dataModels = {
        weapon: WeaponData,
        armor: ArmorData,
    };

    console.log(CONFIG.Dice);
    CONFIG.Dice.rolls.push(SDRoll);
    CONFIG.Dice.rolls.push(RollCharacter);

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheetV2);
    Actors.registerSheet(game.system.id, CharacterSheet, {
        types: ["character"],
        makeDefault: true,
        label: "SD.sheet.character.name",
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
