export class SDItem extends Item {
    prepareDerivedData() {
        super.prepareDerivedData();
        this.system.prepareDerivedData?.();
    }

    async rollDamage(abilities) {
        if (!this.system?.damage) {
            return null;
        }
    }
}
