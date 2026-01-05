import { SD } from "../config.mjs";

const { loadTemplates } = foundry.applications.handlebars;

export async function preloadTemplates() {
    const paths = [
        `${SD.templatesPath}/actors/main-resources.html`,

        `${SD.templatesPath}/actors/character/character-header.html`,
        `${SD.templatesPath}/actors/character/character-attributes-tab.html`,
        `${SD.templatesPath}/actors/character/character-inventory-tab.html`,
        `${SD.templatesPath}/actors/character/character-notes-tab.html`,

        `${SD.templatesPath}/actors/npc/npc-header.html`,
        `${SD.templatesPath}/actors/npc/npc-attributes.html`,

        `${SD.templatesPath}/items/item-header.html`,
    ];
    const templates = paths.reduce((obj, path) => (obj[`sd.${path.split('/').pop().replace(".html", "")}`] = path, obj), {});
    return loadTemplates(templates);
}
