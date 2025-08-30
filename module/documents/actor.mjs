import { SDRoll } from "../dice/roll.mjs";
import { RollCharacter } from "../dice/roll_character.mjs";

export class SDActor extends Actor {
    prepareDerivedData() {
        super.prepareDerivedData();
        this.system.prepareDerivedData?.();
    }

    async _makeRoll(formula, data, flavor, is_success) {
        const roll_data = { ...this.getRollData(), roll: data };
        const result = await new SDRoll(formula, roll_data, { flavor: roll_data }).roll();
        const success = is_success(result.total);
        if (success !== null) {
            result.data.roll.success = success;
            result.data.roll.cssSuccess = success ? "success" : "failure";
        }
        console.log(result);
        result.toMessage({
            flavor,
            speaker: { actor: this },
        });
        return result;
    }

    async rollCharacter() {
        let rolls = Object.entries(CONFIG.SD.abilities).reduce((obj, [k, v]) => (obj[k] = new RollCharacter("3d6", this.getRollData(), { flavor: `SD.ability.${k}.long` }), obj), {});
        for (const [k, v] of Object.entries(rolls)) {
            rolls[k] = await v.roll();
        }
        const abilities = Object.entries(rolls).reduce((obj, [k, v]) => (obj[k] = v.total, obj), {});
        let data = {
            system: this,
            speaker: { actor: this },
            title: "SD.roll.character",
            flavor: game.i18n.localize("SD.roll.character"),
            rolls: [],
        };
        for (const [k, v] of Object.entries(rolls)) {
            const rolls = data.rolls;
            data = await v.toMessage(data, { create: false });
            data.rolls = rolls.concat(data.rolls);
        }
        this.update({ system: { abilities } });
        ChatMessage.create(data);
        return rolls;
    }

    async rollAbilityCheck(ability, target = null) {
        const ability_name = game.i18n.localize(`SD.ability.${ability}.short`);
        const flavor = target
            ? game.i18n.format("SD.roll.ability_dc", { ability: ability_name, target })
            : game.i18n.format("SD.roll.ability", { ability: ability_name });
        const result = await this._makeRoll(`2d8 + @abilities_mod.${ability}`, {
            mode: "ability",
            ability,
            target,
        }, flavor, (total) => (target ? total >= target : null));
        //const result = await new Roll(`2d8 + @abilities_mod.${ability}`, this.getRollData(), { flavor: game.i18n.format("SD.roll.ability", { char: this.name, ability: ability_name }) });
        return result;
    }

    async rollSavingThrowCheck(saving_throw) {
        const target = this.system.saving_throws[saving_throw];
        const saving_throw_name = game.i18n.localize(`SD.st.${saving_throw}`);
        const result = await this._makeRoll("1d20", {
            mode: "saving_throw",
            saving_throw,
            target,
        }, game.i18n.format("SD.roll.saving_throw", { st: saving_throw_name, target }), (total) => (total >= target));
        return result;
    }
}
