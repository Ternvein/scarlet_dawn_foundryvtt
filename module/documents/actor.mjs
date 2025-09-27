import { SDRoll } from "../dice/roll.mjs";

export class SDActor extends Actor {
    prepareDerivedData() {
        super.prepareDerivedData();
        this.system.prepareDerivedData?.();
    }

    get is_new() {
        return this.system.is_new;
    }

    async _makeRoll(formula, target, data, flavor, roll_flavor, is_success) {
        const result = await new SDRoll(formula, this.getRollData(), { flavor: roll_flavor, target, system: data }).roll();
        const success = is_success(result.total);
        if (success !== null) {
            result.options.is_success = success;
        }
        console.log(result);
        result.toMessage({
            flavor,
            speaker: ChatMessage.getSpeaker({ actor: this }),
        });
        return result;
    }

    async rollAbilities() {
        let rolls = Object.entries(CONFIG.SD.abilities).reduce((obj, [k, v]) => (obj[k] = new SDRoll("3d6", this.getRollData(), { flavor: `SD.ability.${k}.long` }), obj), {});
        let data = {
            system: this,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            title: "SD.roll.character",
            flavor: game.i18n.localize("SD.roll.character"),
            rolls: [],
        };
        for (const [k, v] of Object.entries(rolls)) {
            await v.roll();
            const rolls = data.rolls;
            data = await v.toMessage(data, { create: false });
            data.rolls = rolls.concat(data.rolls);
        }
        const abilities = Object.entries(rolls).reduce((obj, [k, v]) => (obj[k] = v.total, obj), {});
        this.update({ system: { abilities } });
        ChatMessage.create(data);
        return rolls;
    }

    async rollMaxHp() {
        const formula = this.system._class?.hd;
        if (!formula) {
            return null;
        }
        const roll = await this._makeRoll(formula, null, null, null, "SD.roll.character_hp", (total) => null);
        const total = roll.total;
        this.update({ system: { resources: { hp: { value: total, max: total } } } });
        return roll;
    }

    async rollAbilityCheck(ability, target = null) {
        const ability_name = game.i18n.localize(`SD.ability.${ability}.short`);
        const flavor = target
            ? game.i18n.format("SD.roll.ability_dc", { ability: ability_name, target })
            : game.i18n.format("SD.roll.ability", { ability: ability_name });
        const result = await this._makeRoll(`2d8 + @abilities_mod.${ability}`, target, {
            mode: "ability",
            ability,
        }, flavor, null, (total) => (target ? total >= target : null));
        return result;
    }

    async rollSavingThrowCheck(saving_throw) {
        const target = this.system.saving_throws[saving_throw];
        const saving_throw_name = game.i18n.localize(`SD.st.${saving_throw}`);
        const flavor = game.i18n.format("SD.roll.saving_throw", { st: saving_throw_name, target });
        const result = await this._makeRoll("1d20", target, {
            mode: "saving_throw",
            saving_throw,
        }, flavor, null, (total) => (total >= target));
        return result;
    }

    async rollAttack() {
        const flavor = game.i18n.localize("SD.roll.attack.name");
        const result = await this._makeRoll("1d20 + @attack_bonus", null, { mode: "attack" }, flavor, null, (total) => null);
        return result;
    }

    async rollInitiativeCheck() {
        const flavor = game.i18n.localize("SD.roll.initiative");
        const result = await this._makeRoll("1d8 + @initiative", null, { mode: "initiative" }, flavor, null, (total) => null);
        return result;
    }

    get weapon() {
        return this.getEmbeddedDocument("Item", this.system.equipment.weapon);
    }

    itemPrepare(id) {
        this.getEmbeddedDocument("Item", id)?.update({ system: { is_prepared: true } });
    }

    itemPack(id) {
        this.getEmbeddedDocument("Item", id)?.update({ system: { is_prepared: false } });
    }

    itemTrash(id) {
        this.deleteEmbeddedDocuments("Item", [id]);
    }

    itemEquip(id, slot) {
        this.update({ system: { equipment: { [slot]: id } } });
    }
}
