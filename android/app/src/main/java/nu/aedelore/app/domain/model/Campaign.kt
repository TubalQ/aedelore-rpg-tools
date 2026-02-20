package nu.aedelore.app.domain.model

data class Campaign(
    val id: Int,
    val name: String,
    val description: String? = null,
    val dmName: String? = null
)
