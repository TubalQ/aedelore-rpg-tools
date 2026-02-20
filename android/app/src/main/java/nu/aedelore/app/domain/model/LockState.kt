package nu.aedelore.app.domain.model

data class LockState(
    val raceClassLocked: Boolean = false,
    val attributesLocked: Boolean = false,
    val abilitiesLocked: Boolean = false
)
