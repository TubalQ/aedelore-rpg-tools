package nu.aedelore.app.domain.model

data class DiceRoll(
    val value: Int,
    val sides: Int,
    val result: DiceResult
)

enum class DiceResult {
    CRITICAL, SUCCESS, BARELY, FAILURE
}

data class DicePoolResult(
    val rolls: List<DiceRoll>,
    val criticals: Int,
    val successes: Int,
    val barelys: Int,
    val failures: Int
)
