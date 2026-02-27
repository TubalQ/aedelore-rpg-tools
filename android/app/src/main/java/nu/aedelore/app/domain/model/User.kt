package nu.aedelore.app.domain.model

data class User(
    val id: Int,
    val username: String,
    val email: String? = null
)
