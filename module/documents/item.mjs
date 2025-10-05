import { SDRoll } from "../dice/roll.mjs";

export class SDItem extends Item {
    static getDefaultArtwork(itemData) {
        return { img: CONFIG.SD.item.icons[itemData.type] ?? this.DEFAULT_ICON };
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
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        });
        return result;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.system.prepareDerivedData?.();
    }

    get weight() {
        return (this.actor?.itemIsEquipped(this.id) ? this.system.weight.equip : this.system.weight.carry) * (this.system.quantity ?? 1);
    }

    get price() {
        return this.system.price * (this.system.quantity ?? 1);
    }

    get weaponAbilities() {
        return CONFIG.SD.weapon.categories[this.system.category]?.abilities ?? [];
    }

    async rollWeapon(target = null) {
        if (this.type !== "weapon") {
            return null;
        }

        const ability_bonus = this.actor?.system.bestAbilityMod?.(this.weaponAbilities);
        const attack_bonus = ability_bonus + this.actor?.system.attack_bonus + this.system.attack_bonus + this.system.enchantment;
        const damage_bonus = ability_bonus + this.actor?.system.damage_bonus + this.system.enchantment;

        const flavor = game.i18n.format("SD.roll.weapon.title", { weapon: this.name });
        const attackFlavor = game.i18n.localize("SD.roll.weapon.attack");
        const damageFlavor = game.i18n.localize("SD.roll.weapon.damage");

        const attackRoll = await new SDRoll(`1d20 + ${attack_bonus}`, this.getRollData(), { flavor: attackFlavor, target }).roll();
        const damageRoll = await new SDRoll(`@damage + ${damage_bonus}`, this.getRollData(), { flavor: damageFlavor }).roll();
        if (target) {
            attackRoll.options.is_success = attackRoll.total >= target;
        }

        let data = {
            system: this,
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
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
}
