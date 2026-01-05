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
            title: "SD.roll.abilities",
            flavor: game.i18n.localize("SD.roll.abilities"),
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
        const formula = this.system._class?.hd ?? `${this.system.hd}d8`;
        if (!formula) {
            return null;
        }
        const roll = await this._makeRoll(formula, null, null, null, "SD.roll.hp.max", (total) => null);
        const total = roll.total;

        this.system.schema.fields.resources.fields.hp.fields.value.max = total;
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

    async rollNpcAttack(idx, target = null) {
        const attack = this.system.attacks?.[idx];
        if (!attack) {
            return null;
        }

        const flavor = game.i18n.format("SD.roll.npc.attack.title", { attack: attack.name });
        const attackFlavor = game.i18n.localize("SD.roll.npc.attack.attack");
        const damageFlavor = game.i18n.localize("SD.roll.npc.attack.damage");

        const attackRoll = await new SDRoll("1d20 + @attack.attack", { ...this.getRollData(), attack: attack }, { flavor: attackFlavor, target }).roll();
        const damageRoll = await new SDRoll("@attack.damage", { ...this.getRollData(), attack: attack }, { flavor: damageFlavor }).roll();
        if (target) {
            attackRoll.options.is_success = attackRoll.total >= target;
        }

        let data = {
            system: this,
            speaker: ChatMessage.getSpeaker({ actor: this }),
            title: flavor,
            flavor,
            rolls: [],
        };
        data = await attackRoll.toMessage(data, { create: false });
        const damageData = await damageRoll.toMessage(data, { create: false });
        data.rolls = data.rolls.concat(damageData.rolls);
        ChatMessage.create(data);

        return [attackRoll, damageRoll];
    }

    async rollInitiativeCheck() {
        const flavor = game.i18n.localize("SD.roll.initiative");
        const result = await this._makeRoll("1d8 + @initiative", null, { mode: "initiative" }, flavor, null, (total) => null);
        return result;
    }

    async npcAttackTrash(idx) {
        let attacks = this.system.attacks;
        if (attacks !== undefined && attacks.splice(idx, 1).length != 0) {
            this.update({ system: { attacks } });
        }
    }

    async npcAttackAdd() {
        const attacks = this.system.attacks;
        if (attacks !== undefined) {
            attacks.push(attacks.element);
            this.update({ system: { attacks } });
        }
    }

    get weapon() {
        return this.getEmbeddedDocument("Item", this.system.equipment.weapon);
    }

    get armor() {
        return this.getEmbeddedDocument("Item", this.system.equipment.armor);
    }

    get shield() {
        return this.getEmbeddedDocument("Item", this.system.equipment.shield);
    }

    itemSheet(id) {
        this.getEmbeddedDocument("Item", id)?.sheet.render(true);
    }

    itemPrepare(id) {
        this.getEmbeddedDocument("Item", id)?.update({ system: { is_prepared: true } });
    }

    itemPack(id) {
        this._itemUnequipUsed(id);
        this.getEmbeddedDocument("Item", id)?.update({ system: { is_prepared: false } });
    }

    itemTrash(id) {
        this._itemUnequipUsed(id);
        this.deleteEmbeddedDocuments("Item", [id]);
    }

    itemEquip(id, slot) {
        const item = this.getEmbeddedDocument("Item", id);
        if (!item) {
            return;
        }
        if (!item.system.is_prepared) {
            return;
        }
        this.update({ system: { equipment: { [slot]: id } } });
    }

    itemUnequip(slot) {
        this.itemEquip("", slot);
    }

    _itemUnequipUsed(id) {
        ["weapon", "armor", "shield"].forEach((slot) => {
            if (this.system.equipment[slot] === id) {
                this.itemUnequip(slot);
            }
        });
    }

    itemIsEquipped(id) {
        return ["weapon", "armor", "shield"].reduce((equip, slot) => {
            return this.system.equipment[slot] === id ? true : equip;
        }, false);
    }
}
