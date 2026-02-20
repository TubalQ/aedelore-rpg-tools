package nu.aedelore.app.ui.sheet

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import nu.aedelore.app.domain.model.CharacterData
import nu.aedelore.app.domain.model.LockState
import nu.aedelore.app.domain.model.PartyMember
import nu.aedelore.app.domain.model.QuestItem
import nu.aedelore.app.domain.repository.CharacterRepository
import nu.aedelore.app.util.Constants
import nu.aedelore.app.util.Result
import javax.inject.Inject

enum class SheetTab(val title: String) {
    OVERVIEW("Overview"),
    CHARACTER("Character"),
    STATS("Stats"),
    COMBAT("Combat"),
    ABILITIES("Abilities"),
    GEAR("Gear"),
    TOOLS("Tools")
}

enum class SaveState {
    IDLE, SAVING, SAVED, ERROR
}

data class CharacterSheetUiState(
    val isLoading: Boolean = true,
    val error: String? = null,
    val characterId: Int = 0,
    val data: CharacterData = CharacterData(),
    val xp: Int = 0,
    val xpSpent: Int = 0,
    val lockState: LockState = LockState(),
    val campaignId: Int? = null,
    val campaignName: String? = null,
    val partyMembers: List<PartyMember> = emptyList(),
    val selectedTab: SheetTab = SheetTab.OVERVIEW,
    val saveState: SaveState = SaveState.IDLE,
    val isDirty: Boolean = false,
    val questItems: List<QuestItem> = emptyList(),
    val archivedQuestItems: List<QuestItem> = emptyList(),
)

@HiltViewModel
class CharacterSheetViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val characterRepository: CharacterRepository,
) : ViewModel() {

    private val characterId: Int = savedStateHandle["characterId"] ?: 0

    private val _uiState = MutableStateFlow(CharacterSheetUiState(characterId = characterId))
    val uiState: StateFlow<CharacterSheetUiState> = _uiState.asStateFlow()

    private var autosaveJob: Job? = null
    private var lastSavedData: CharacterData? = null

    init {
        loadCharacter()
        startAutosave()
    }

    private fun loadCharacter() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            when (val result = characterRepository.getCharacter(characterId)) {
                is Result.Success -> {
                    val sheet = result.data
                    lastSavedData = sheet.data
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            data = sheet.data,
                            xp = sheet.xp,
                            xpSpent = sheet.xpSpent,
                            lockState = sheet.lockState,
                            campaignId = sheet.campaignId,
                            campaignName = sheet.campaignName,
                            questItems = sheet.data.quest_items.map { qi ->
                                QuestItem(
                                    name = qi.name,
                                    description = qi.description,
                                    givenAt = qi.givenAt,
                                    sessionName = qi.sessionName,
                                    archivedAt = qi.archivedAt,
                                )
                            },
                            archivedQuestItems = sheet.data.quest_items_archived.map { qi ->
                                QuestItem(
                                    name = qi.name,
                                    description = qi.description,
                                    givenAt = qi.givenAt,
                                    sessionName = qi.sessionName,
                                    archivedAt = qi.archivedAt,
                                )
                            },
                        )
                    }
                    // Load party if in campaign
                    if (sheet.campaignId != null) {
                        loadParty()
                    }
                }
                is Result.Error -> {
                    _uiState.update { it.copy(isLoading = false, error = result.message) }
                }
                is Result.Loading -> {}
            }
        }
    }

    private fun startAutosave() {
        autosaveJob = viewModelScope.launch {
            while (true) {
                delay(Constants.AUTOSAVE_INTERVAL_MS)
                if (_uiState.value.isDirty) {
                    saveToServer()
                }
            }
        }
    }

    fun selectTab(tab: SheetTab) {
        _uiState.update { it.copy(selectedTab = tab) }
    }

    fun updateData(transform: (CharacterData) -> CharacterData) {
        _uiState.update { state ->
            val newData = transform(state.data)
            state.copy(data = newData, isDirty = true, saveState = SaveState.IDLE)
        }
        // Save locally immediately
        viewModelScope.launch {
            val state = _uiState.value
            characterRepository.saveLocal(characterId, state.data.character_name, state.data)
        }
    }

    fun saveToServer() {
        val state = _uiState.value
        if (!state.isDirty) return
        viewModelScope.launch {
            _uiState.update { it.copy(saveState = SaveState.SAVING) }
            when (characterRepository.updateCharacter(characterId, state.data.character_name, state.data)) {
                is Result.Success -> {
                    lastSavedData = state.data
                    _uiState.update { it.copy(saveState = SaveState.SAVED, isDirty = false) }
                    // Reset save indicator after 2 seconds
                    delay(2000)
                    _uiState.update {
                        if (it.saveState == SaveState.SAVED) it.copy(saveState = SaveState.IDLE) else it
                    }
                }
                is Result.Error -> {
                    _uiState.update { it.copy(saveState = SaveState.ERROR) }
                }
                is Result.Loading -> {}
            }
        }
    }

    // Campaign functions
    fun linkCampaign(shareCode: String) {
        viewModelScope.launch {
            when (val result = characterRepository.linkCampaign(characterId, shareCode)) {
                is Result.Success -> {
                    _uiState.update { it.copy(campaignName = result.data) }
                    loadCharacter() // Reload to get campaign info
                }
                is Result.Error -> {
                    _uiState.update { it.copy(error = result.message) }
                }
                is Result.Loading -> {}
            }
        }
    }

    fun unlinkCampaign() {
        viewModelScope.launch {
            when (characterRepository.unlinkCampaign(characterId)) {
                is Result.Success -> {
                    _uiState.update {
                        it.copy(campaignId = null, campaignName = null, partyMembers = emptyList())
                    }
                }
                is Result.Error -> {}
                is Result.Loading -> {}
            }
        }
    }

    private fun loadParty() {
        viewModelScope.launch {
            when (val result = characterRepository.getParty(characterId)) {
                is Result.Success -> {
                    _uiState.update { it.copy(partyMembers = result.data) }
                }
                is Result.Error -> {}
                is Result.Loading -> {}
            }
        }
    }

    // Lock functions
    fun lockRaceClass() {
        viewModelScope.launch {
            when (characterRepository.lockRaceClass(characterId)) {
                is Result.Success -> {
                    _uiState.update {
                        it.copy(lockState = it.lockState.copy(raceClassLocked = true))
                    }
                }
                is Result.Error -> {}
                is Result.Loading -> {}
            }
        }
    }

    fun lockAttributes() {
        viewModelScope.launch {
            when (characterRepository.lockAttributes(characterId)) {
                is Result.Success -> {
                    _uiState.update {
                        it.copy(lockState = it.lockState.copy(attributesLocked = true))
                    }
                }
                is Result.Error -> {}
                is Result.Loading -> {}
            }
        }
    }

    fun lockAbilities() {
        viewModelScope.launch {
            when (characterRepository.lockAbilities(characterId)) {
                is Result.Success -> {
                    _uiState.update {
                        it.copy(lockState = it.lockState.copy(abilitiesLocked = true))
                    }
                }
                is Result.Error -> {}
                is Result.Loading -> {}
            }
        }
    }

    fun spendAttributePoints(count: Int) {
        viewModelScope.launch {
            when (val result = characterRepository.spendAttributePoints(characterId, count)) {
                is Result.Success -> {
                    _uiState.update {
                        it.copy(xp = result.data.first, xpSpent = result.data.second)
                    }
                }
                is Result.Error -> {
                    _uiState.update { it.copy(error = result.message) }
                }
                is Result.Loading -> {}
            }
        }
    }

    // Quest item functions
    fun archiveQuestItem(index: Int) {
        viewModelScope.launch {
            when (val result = characterRepository.archiveQuestItem(characterId, index)) {
                is Result.Success -> {
                    _uiState.update {
                        it.copy(
                            questItems = result.data.first,
                            archivedQuestItems = result.data.second,
                        )
                    }
                }
                is Result.Error -> {}
                is Result.Loading -> {}
            }
        }
    }

    fun unarchiveQuestItem(index: Int) {
        viewModelScope.launch {
            when (val result = characterRepository.unarchiveQuestItem(characterId, index)) {
                is Result.Success -> {
                    _uiState.update {
                        it.copy(
                            questItems = result.data.first,
                            archivedQuestItems = result.data.second,
                        )
                    }
                }
                is Result.Error -> {}
                is Result.Loading -> {}
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }

    override fun onCleared() {
        super.onCleared()
        autosaveJob?.cancel()
        // Final save on destroy
        // Note: viewModelScope is cancelled here, so the app lifecycle handler
        // should handle final saves via WorkManager or similar mechanism.
    }
}
