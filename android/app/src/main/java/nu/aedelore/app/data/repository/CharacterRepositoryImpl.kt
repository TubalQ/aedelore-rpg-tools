package nu.aedelore.app.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.jsonObject
import nu.aedelore.app.data.local.dao.CharacterDao
import nu.aedelore.app.data.local.entity.CharacterEntity
import nu.aedelore.app.data.remote.api.CharacterApi
import nu.aedelore.app.data.remote.dto.character.CharacterCreateRequest
import nu.aedelore.app.data.remote.dto.character.CharacterUpdateRequest
import nu.aedelore.app.data.remote.dto.character.LinkCampaignRequest
import nu.aedelore.app.data.remote.dto.character.ArchiveItemRequest
import nu.aedelore.app.data.remote.dto.character.SpendPointsRequest
import nu.aedelore.app.data.remote.dto.character.UnarchiveItemRequest
import nu.aedelore.app.domain.model.CharacterData
import nu.aedelore.app.domain.model.LockState
import nu.aedelore.app.domain.model.PartyMember
import nu.aedelore.app.domain.model.QuestItem
import nu.aedelore.app.domain.repository.CharacterListEntry
import nu.aedelore.app.domain.repository.CharacterRepository
import nu.aedelore.app.domain.repository.CharacterSheet
import nu.aedelore.app.util.Result
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CharacterRepositoryImpl @Inject constructor(
    private val characterApi: CharacterApi,
    private val characterDao: CharacterDao,
    private val json: Json,
) : CharacterRepository {

    override fun observeCharacters(): Flow<List<CharacterListEntry>> {
        return characterDao.getAllCharacters().map { entities ->
            entities.map { it.toListEntry() }
        }
    }

    override suspend fun refreshCharacters(): Result<List<CharacterListEntry>> {
        return try {
            val response = characterApi.getCharacters()
            if (response.isSuccessful) {
                val items = response.body() ?: emptyList()
                val entities = items.map { item ->
                    val existing = characterDao.getCharacterById(item.id)
                    CharacterEntity(
                        id = item.id,
                        name = item.name,
                        system = item.system,
                        dataJson = existing?.dataJson,
                        updatedAt = item.updatedAt,
                        isDirty = existing?.isDirty ?: false
                    )
                }
                characterDao.insertCharacters(entities)
                Result.Success(entities.map { it.toListEntry() })
            } else {
                Result.Error("Failed to load characters: ${response.code()}")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun getCharacter(id: Int): Result<CharacterSheet> {
        return try {
            val response = characterApi.getCharacter(id)
            if (response.isSuccessful) {
                val detail = response.body()!!
                val dataStr = detail.data?.toString() ?: "{}"
                val characterData = json.decodeFromString<CharacterData>(dataStr)

                characterDao.insertCharacter(
                    CharacterEntity(
                        id = detail.id,
                        name = detail.name,
                        system = detail.system,
                        dataJson = dataStr,
                        xp = detail.xp,
                        xpSpent = detail.xpSpent,
                        raceClassLocked = detail.raceClassLocked,
                        attributesLocked = detail.attributesLocked,
                        abilitiesLocked = detail.abilitiesLocked,
                        campaignId = detail.campaignId,
                        campaignName = detail.campaign?.name,
                        updatedAt = detail.updatedAt,
                        isDirty = false
                    )
                )

                Result.Success(
                    CharacterSheet(
                        id = detail.id,
                        name = detail.name,
                        data = characterData,
                        xp = detail.xp,
                        xpSpent = detail.xpSpent,
                        lockState = LockState(
                            raceClassLocked = detail.raceClassLocked,
                            attributesLocked = detail.attributesLocked,
                            abilitiesLocked = detail.abilitiesLocked
                        ),
                        campaignId = detail.campaignId,
                        campaignName = detail.campaign?.name
                    )
                )
            } else {
                // Try local cache
                val cached = characterDao.getCharacterById(id)
                if (cached != null) {
                    Result.Success(cached.toSheet())
                } else {
                    Result.Error("Failed to load character: ${response.code()}")
                }
            }
        } catch (e: Exception) {
            val cached = characterDao.getCharacterById(id)
            if (cached != null) {
                Result.Success(cached.toSheet())
            } else {
                Result.Error(e.message ?: "Network error")
            }
        }
    }

    override fun observeCharacter(id: Int): Flow<CharacterSheet?> {
        return characterDao.observeCharacter(id).map { entity ->
            entity?.toSheet()
        }
    }

    override suspend fun createCharacter(name: String, data: CharacterData): Result<Int> {
        return try {
            val dataStr = json.encodeToString(data)
            val dataJson = json.parseToJsonElement(dataStr).jsonObject
            val response = characterApi.createCharacter(
                CharacterCreateRequest(name = name, data = dataJson)
            )
            if (response.isSuccessful && response.body()?.success == true) {
                val id = response.body()!!.id!!
                characterDao.insertCharacter(
                    CharacterEntity(
                        id = id,
                        name = name,
                        dataJson = dataStr,
                        isDirty = false
                    )
                )
                Result.Success(id)
            } else {
                Result.Error(response.body()?.error ?: "Failed to create character")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun updateCharacter(id: Int, name: String, data: CharacterData): Result<Unit> {
        return try {
            val dataStr = json.encodeToString(data)
            val dataJson = json.parseToJsonElement(dataStr).jsonObject
            val response = characterApi.updateCharacter(
                id,
                CharacterUpdateRequest(name = name, data = dataJson)
            )
            if (response.isSuccessful) {
                characterDao.clearDirty(id)
                Result.Success(Unit)
            } else {
                Result.Error("Failed to save: ${response.code()}")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun deleteCharacter(id: Int): Result<Unit> {
        return try {
            val response = characterApi.deleteCharacter(id)
            if (response.isSuccessful) {
                characterDao.deleteCharacter(id)
                Result.Success(Unit)
            } else {
                Result.Error("Failed to delete: ${response.code()}")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun saveLocal(id: Int, name: String, data: CharacterData) {
        val dataStr = json.encodeToString(data)
        val existing = characterDao.getCharacterById(id)
        if (existing != null) {
            characterDao.insertCharacter(
                existing.copy(name = name, dataJson = dataStr, isDirty = true)
            )
        }
    }

    override suspend fun syncDirtyCharacters(): Result<Unit> {
        return try {
            val dirty = characterDao.getDirtyCharacters()
            for (entity in dirty) {
                val dataStr = entity.dataJson ?: continue
                val dataJson = json.parseToJsonElement(dataStr).jsonObject
                val response = characterApi.updateCharacter(
                    entity.id,
                    CharacterUpdateRequest(name = entity.name, data = dataJson)
                )
                if (response.isSuccessful) {
                    characterDao.clearDirty(entity.id)
                }
            }
            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(e.message ?: "Sync failed")
        }
    }

    override suspend fun linkCampaign(characterId: Int, shareCode: String): Result<String> {
        return try {
            val response = characterApi.linkCampaign(characterId, LinkCampaignRequest(shareCode))
            if (response.isSuccessful && response.body()?.success == true) {
                val name = response.body()?.campaignName ?: ""
                Result.Success(name)
            } else {
                Result.Error(response.body()?.error ?: "Failed to link")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun unlinkCampaign(characterId: Int): Result<Unit> {
        return try {
            val response = characterApi.unlinkCampaign(characterId)
            if (response.isSuccessful) Result.Success(Unit)
            else Result.Error("Failed to unlink")
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun getParty(characterId: Int): Result<List<PartyMember>> {
        return try {
            val response = characterApi.getParty(characterId)
            if (response.isSuccessful) {
                val members = response.body()?.party?.map {
                    PartyMember(id = it.id, name = it.name, playerName = it.playerName)
                } ?: emptyList()
                Result.Success(members)
            } else {
                Result.Error("Failed to get party")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun lockRaceClass(characterId: Int): Result<Unit> {
        return try {
            val response = characterApi.lockRaceClass(characterId)
            if (response.isSuccessful && response.body()?.success == true) Result.Success(Unit)
            else Result.Error(response.body()?.error ?: "Failed to lock")
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun lockAttributes(characterId: Int): Result<Unit> {
        return try {
            val response = characterApi.lockAttributes(characterId)
            if (response.isSuccessful && response.body()?.success == true) Result.Success(Unit)
            else Result.Error(response.body()?.error ?: "Failed to lock")
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun lockAbilities(characterId: Int): Result<Unit> {
        return try {
            val response = characterApi.lockAbilities(characterId)
            if (response.isSuccessful && response.body()?.success == true) Result.Success(Unit)
            else Result.Error(response.body()?.error ?: "Failed to lock")
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun spendAttributePoints(characterId: Int, count: Int): Result<Pair<Int, Int>> {
        return try {
            val response = characterApi.spendAttributePoints(characterId, SpendPointsRequest(count))
            if (response.isSuccessful && response.body()?.success == true) {
                val body = response.body()!!
                Result.Success(Pair(body.xp, body.xpSpent))
            } else {
                Result.Error(response.body()?.error ?: "Failed")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun archiveQuestItem(characterId: Int, itemIndex: Int): Result<Pair<List<QuestItem>, List<QuestItem>>> {
        return try {
            val response = characterApi.archiveItem(characterId, ArchiveItemRequest(itemIndex))
            if (response.isSuccessful) {
                val body = response.body()!!
                Result.Success(Pair(
                    body.questItems.map { QuestItem(it.name, it.description, it.givenAt, it.sessionName, it.archivedAt) },
                    body.questItemsArchived.map { QuestItem(it.name, it.description, it.givenAt, it.sessionName, it.archivedAt) }
                ))
            } else {
                Result.Error("Failed to archive")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun unarchiveQuestItem(characterId: Int, archiveIndex: Int): Result<Pair<List<QuestItem>, List<QuestItem>>> {
        return try {
            val response = characterApi.unarchiveItem(characterId, UnarchiveItemRequest(archiveIndex))
            if (response.isSuccessful) {
                val body = response.body()!!
                Result.Success(Pair(
                    body.questItems.map { QuestItem(it.name, it.description, it.givenAt, it.sessionName, it.archivedAt) },
                    body.questItemsArchived.map { QuestItem(it.name, it.description, it.givenAt, it.sessionName, it.archivedAt) }
                ))
            } else {
                Result.Error("Failed to unarchive")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    private fun CharacterEntity.toListEntry() = CharacterListEntry(
        id = id,
        name = name,
        system = system,
        updatedAt = updatedAt
    )

    private fun CharacterEntity.toSheet(): CharacterSheet {
        val characterData = if (dataJson != null) {
            try {
                json.decodeFromString<CharacterData>(dataJson)
            } catch (e: Exception) {
                CharacterData()
            }
        } else {
            CharacterData()
        }
        return CharacterSheet(
            id = id,
            name = name,
            data = characterData,
            xp = xp,
            xpSpent = xpSpent,
            lockState = LockState(
                raceClassLocked = raceClassLocked,
                attributesLocked = attributesLocked,
                abilitiesLocked = abilitiesLocked
            ),
            campaignId = campaignId,
            campaignName = campaignName
        )
    }
}
