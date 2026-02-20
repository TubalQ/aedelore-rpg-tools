package nu.aedelore.app.domain.model

data class ProgressionState(
    val xp: Int = 0,
    val xpSpent: Int = 0,
    val lockState: LockState = LockState()
) {
    val earnedPoints: Int get() = xp / 10
    val usedPoints: Int get() = xpSpent / 10
    val availablePoints: Int get() = earnedPoints - usedPoints
}
