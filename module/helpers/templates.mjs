import { SD } from "../config.mjs";

const { loadTemplates } = foundry.applications.handlebars;

export async function preloadTemplates() {
    const templates = [
        `${SD.systemPath}/templates/actors/character/character-header.html`,
        `${SD.systemPath}/templates/actors/character/character-attributes-tab.html`,
        `${SD.systemPath}/templates/actors/character/character-inventory-tab.html`,
        `${SD.systemPath}/templates/actors/character/character-notes-tab.html`,
    ];
    return loadTemplates(templates);
}
