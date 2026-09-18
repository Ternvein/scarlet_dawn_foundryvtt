import { SD } from "../config.mjs";

const { loadTemplates } = foundry.applications.handlebars;

export async function preloadTemplates() {
    const paths = [
        `${SD.templatesPath}/actors/main-resources.html`,

        `${SD.templatesPath}/actors/pc/pc-header.html`,
        `${SD.templatesPath}/actors/pc/pc-attributes-tab.html`,
        `${SD.templatesPath}/actors/pc/pc-inventory-tab.html`,
        `${SD.templatesPath}/actors/pc/pc-traits-tab.html`,
        `${SD.templatesPath}/actors/pc/pc-spells-tab.html`,
        `${SD.templatesPath}/actors/pc/pc-notes-tab.html`,

        `${SD.templatesPath}/actors/npc/npc-header.html`,
        `${SD.templatesPath}/actors/npc/npc-attributes-tab.html`,
        `${SD.templatesPath}/actors/npc/npc-description-tab.html`,

        `${SD.templatesPath}/items/item-header.html`,
        `${SD.templatesPath}/items/item-description.html`,
    ];
    const templates = paths.reduce((obj, path) => (obj[`sd.${path.split('/').pop().replace(".html", "")}`] = path, obj), {});
    return loadTemplates(templates);
}
