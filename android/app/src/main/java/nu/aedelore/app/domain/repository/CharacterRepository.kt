package nu.aedelore.app.domain.repository

import kotlinx.coroutines.flow.Flow
import nu.aedelore.app.domain.model.CharacterData
import nu.aedelore.app.domain.model.LockState
import nu.aedelore.app.domain.model.PartyMember
import nu.aedelore.app.domain.model.QuestItem
import nu.aedelore.app.util.Result

data class CharacterSheet(
    val id: Int,
    val name: String,
    val data: CharacterData,
    val xp: Int = 0,
    val xpSpent: Int = 0,
    val lockState: LockState = LockState(),
    val campaignId: Int? = null,
    val campaignName: String? = null
)

data class CharacterListEntry(
    val id: Int,
    val name: String,
    val system: String,
    val updatedAt: String?
)

interface CharacterRepository {
    fun observeCharacters(): Flow<List<CharacterListEntry>>
    suspend fun refreshCharacters(): Result<List<CharacterListEntry>>
    suspend fun getCharacter(id: Int): Result<CharacterSheet>
    fun observeCharacter(id: Int): Flow<CharacterSheet?>
    suspend fun createCharacter(name: String, data: CharacterData): Result<Int>
    suspend fun updateCharacter(id: Int, name: String, data: CharacterData): Result<Unit>
    suspend fun deleteCharacter(id: Int): Result<Unit>
    suspend fun saveLocal(id: Int, name: String, data: CharacterData)
    suspend fun syncDirtyCharacters(): Result<Unit>
    suspend fun linkCampaign(characterId: Int, shareCode: String): Result<String>
    suspend fun unlinkCampaign(characterId: Int): Result<Unit>
    suspend fun getParty(characterId: Int): Result<List<PartyMember>>
    suspend fun lockRaceClass(characterId: Int): Result<Unit>
    suspend fun lockAttributes(characterId: Int): Result<Unit>
    suspend fun lockAbilities(characterId: Int): Result<Unit>
    suspend fun spendAttributePoints(characterId: Int, count: Int): Result<Pair<Int, Int>>
    suspend fun archiveQuestItem(characterId: Int, itemIndex: Int): Result<Pair<List<QuestItem>, List<QuestItem>>>
    suspend fun unarchiveQuestItem(characterId: Int, archiveIndex: Int): Result<Pair<List<QuestItem>, List<QuestItem>>>
}
