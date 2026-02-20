package nu.aedelore.app.domain.model

data class Character(
    val id: Int,
    val name: String,
    val system: String = "aedelore",
    val updatedAt: String? = null
)
