package nu.aedelore.app.data.remote.dto.trash

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TrashCharacterItem(
    val id: Int,
    val name: String,
    val system: String = "aedelore",
    @SerialName("deleted_at") val deletedAt: String? = null
)
