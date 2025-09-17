import { SD } from "../config.mjs";

const { loadTemplates } = foundry.applications.handlebars;

export async function preloadTemplates() {
    const templates = [
        `${SD.templatesPath}/actors/character/character-header.html`,
        `${SD.templatesPath}/actors/character/character-attributes-tab.html`,
        `${SD.templatesPath}/actors/character/character-inventory-tab.html`,
        `${SD.templatesPath}/actors/character/character-notes-tab.html`,

        `${SD.templatesPath}/items/item-header.html`,
    ];
    return loadTemplates(templates);
}
