package nu.aedelore.app.domain.repository

import nu.aedelore.app.util.Result

data class TrashCharacter(
    val id: Int,
    val name: String,
    val system: String,
    val deletedAt: String?
)

interface TrashRepository {
    suspend fun getTrashCharacters(): Result<List<TrashCharacter>>
    suspend fun restoreCharacter(id: Int): Result<Unit>
    suspend fun permanentDeleteCharacter(id: Int): Result<Unit>
}
