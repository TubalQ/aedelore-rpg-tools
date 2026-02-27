package nu.aedelore.app.data.repository

import nu.aedelore.app.data.remote.api.TrashApi
import nu.aedelore.app.domain.repository.TrashCharacter
import nu.aedelore.app.domain.repository.TrashRepository
import nu.aedelore.app.util.Result
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TrashRepositoryImpl @Inject constructor(
    private val trashApi: TrashApi,
) : TrashRepository {

    override suspend fun getTrashCharacters(): Result<List<TrashCharacter>> {
        return try {
            val response = trashApi.getTrashCharacters()
            if (response.isSuccessful) {
                val items = response.body() ?: emptyList()
                Result.Success(items.map {
                    TrashCharacter(
                        id = it.id,
                        name = it.name,
                        system = it.system,
                        deletedAt = it.deletedAt
                    )
                })
            } else {
                Result.Error("Failed to load trash")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun restoreCharacter(id: Int): Result<Unit> {
        return try {
            val response = trashApi.restoreCharacter(id)
            if (response.isSuccessful) Result.Success(Unit)
            else Result.Error("Failed to restore")
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun permanentDeleteCharacter(id: Int): Result<Unit> {
        return try {
            val response = trashApi.permanentDeleteCharacter(id)
            if (response.isSuccessful) Result.Success(Unit)
            else Result.Error("Failed to delete permanently")
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }
}
