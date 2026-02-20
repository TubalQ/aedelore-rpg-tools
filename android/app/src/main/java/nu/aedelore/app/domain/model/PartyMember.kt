package nu.aedelore.app.domain.model

data class PartyMember(
    val id: Int,
    val name: String,
    val playerName: String? = null
)
