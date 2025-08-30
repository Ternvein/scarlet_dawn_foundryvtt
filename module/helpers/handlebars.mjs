import { SD } from "../config.mjs";

export function registerHelpers() {
    Handlebars.registerHelper({
        "path": (relativePath) => `${SD.systemPath}/${relativePath}`,
        "partial": (relativePath) => `${SD.systemPath}/templates/${relativePath}`,
        "make-object": ({ hash }) => (hash),
        "number-sign": (number) => (number <= 0 ? "" : "+") + number,
    });
}
