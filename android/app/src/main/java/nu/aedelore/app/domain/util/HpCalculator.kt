package nu.aedelore.app.domain.util

import nu.aedelore.app.domain.gamedata.Classes
import nu.aedelore.app.domain.gamedata.Races

/**
 * Calculates max HP for a character based on race and class.
 *
 * Formula (from autoFillHP in character-sheet.html):
 *   maxHP = race.hp + class.hpBonus
 *
 * Examples:
 *   Human (20) + Warrior (+5)    = 25
 *   Orc (24)   + Warrior (+5)    = 29
 *   Halfling (14) + Thief/Rogue (+2) = 16
 *   High Elf (16) + Mage (+2)    = 18
 */
object HpCalculator {

    /**
     * Calculate the maximum HP for a character.
     *
     * @param raceName  The race name exactly as it appears in [Races.all],
     *                  e.g. "Human", "Dwarf", "High Elf".
     * @param className The class name exactly as it appears in [Classes.all],
     *                  e.g. "Warrior", "Thief/Rogue", "Mage".
     * @return The max HP value. Returns 0 if neither race nor class is found.
     */
    fun calculateMaxHp(raceName: String, className: String): Int {
        val race = Races.byName(raceName)
        val cls = Classes.byName(className)
        val raceHp = race?.hp ?: 0
        val classHpBonus = cls?.hpBonus ?: 0
        return raceHp + classHpBonus
    }
}
