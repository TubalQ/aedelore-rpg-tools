package nu.aedelore.app.domain.model

data class QuestItem(
    val name: String,
    val description: String = "",
    val givenAt: String? = null,
    val sessionName: String? = null,
    val archivedAt: String? = null
)
