export const SD = {
    get systemPath() {
        // Currently this function has to be called in static context, which means that `game.system` is unavailable yet
        //return `systems/${game.system.id}`;
        return "systems/scarlet-dawn";
    },

    get assetsPath() {
        return `${this.systemPath}/assets`;
    },

    get templatesPath() {
        return `${this.systemPath}/templates`;
    },

    roll_dc: {
        easy: 9,
        medium: 11,
        hard: 13,
        extreme: 15,
        heroic: 17,
    },

    abilities: {
        str: "SD.ability.str",
        dex: "SD.ability.dex",
        con: "SD.ability.con",
        int: "SD.ability.int",
        wis: "SD.ability.wis",
        cha: "SD.ability.cha",
    },

    abilityToMod(score) {
        if (score <= 3) {
            return -2;
        } else if (score <= 7) {
            return -1;
        } else if (score <= 13) {
            return 0;
        } else if (score <= 17) {
            return 1;
        } else {
            return 2;
        }
    },

    races: {
        human: {},
        dwarf: {},
        halfling: {},
        elf: {}
    },

    alignment: {
        systems: ["basic", "advanced"],
        system: "basic",
        all_variants: {
            basic: ["lawful", "neutral", "chaotic"],
            advanced: ["lg", "ln", "le", "ng", "n", "ne", "cg", "cn", "ce"],
        },

        get variants() {
            return this.all_variants[this.system] ?? [];
        },
    },

    classes: {
        fighter: {},
        cleric: {},
        thief: {},
        mage: {},
        descendant: {},
        devoted: {},
        assassin: {},
        gray_cleric: {},
        druid: {},
        gray_mage: {},
        illusionist: {},
        paladin: {},
        ranger: {},
    },

    progress: {
        systems: ["treasure", "tasks"],
        system: "treasure",
        treasure: {
            name: "SD.progress.treasure",
            table: [
                2000,
                4000,
                8000,
                16000,
                32000,
                64000,
                128000,
                250000,
                370000,
            ],
            next: 125000,
        },
        tasks: {
            name: "SD.progress.tasks",
            table: [
                3,
                6,
                12,
                18,
                27,
                39,
                54,
                72,
                93,
            ],
            next: 24,
        },
        max_level: 50,

        *gen(type) {
            let progress;
            switch (type) {
                case "treasure":
                    progress = this.treasure;
                    break;
                case "tasks":
                    progress = this.tasks;
                    break;
                default:
                    return 0;
            }

            yield* progress.table;
            let last = progress.table[progress.table.length - 1];
            while (true) {
                last += progress.next;
                yield last;
            }
        },

        get table() {
            return this.gen(this.system).take(this.max_level).toArray();
        },

        levelToXp(level) {
            const table = [0, ...this.table];
            return table[Math.clamp(level - 1, 0, this.max_level)];
        },

        xpToLevelUp(level) {
            const table = this.table;
            return table[Math.clamp(level - 1, 0, this.max_level)]
        },

        xpToLevel(xp) {
            const table = this.table;
            const level = table.findIndex((v) => v > xp) + 1;
            return level <= 0 ? this.max_level : level;
        },
    },

    movement_types: {
        land: "SD.movement.land",
        climb: "SD.movement.climb",
        swim: "SD.movement.swim",
        fly: "SD.movement.fly",
        burrow: "SD.movement.burrow",
    },

    saving_throws: {
        fortitude: {
            label: "SD.st.fortitude",
            abilities: ["str", "con"],
            armor_penalty: true,
        },
        reflex: {
            label: "SD.st.reflex",
            abilities: ["dex", "int"],
            armor_penalty: true,
        },
        will: {
            label: "SD.st.will",
            abilities: ["wis", "cha"],
            armor_penalty: true,
        },
        luck: {
            label: "SD.st.luck",
            abilities: [],
            armor_penalty: false,
        },
    },

    splendor: {
        table: [
            1,
            6,
            11,
            16,
        ],
    },

    splendorToMaxRerolls(splendor) {
        return this.splendor.table.findIndex((v) => v > splendor);
    }
};

export default SD;
