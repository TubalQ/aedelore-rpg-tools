package nu.aedelore.app.ui.characterlist

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import nu.aedelore.app.domain.model.CharacterData
import nu.aedelore.app.domain.repository.CharacterListEntry
import nu.aedelore.app.domain.repository.CharacterRepository
import nu.aedelore.app.util.Result
import javax.inject.Inject

data class CharacterListUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val isCreating: Boolean = false,
    val showCreateDialog: Boolean = false
)

@HiltViewModel
class CharacterListViewModel @Inject constructor(
    private val characterRepository: CharacterRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(CharacterListUiState())
    val uiState: StateFlow<CharacterListUiState> = _uiState.asStateFlow()

    val characters: StateFlow<List<CharacterListEntry>> = characterRepository
        .observeCharacters()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        refreshCharacters()
    }

    fun refreshCharacters() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = characterRepository.refreshCharacters()) {
                is Result.Success -> {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
                is Result.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                is Result.Loading -> {}
            }
        }
    }

    fun showCreateDialog() {
        _uiState.value = _uiState.value.copy(showCreateDialog = true)
    }

    fun hideCreateDialog() {
        _uiState.value = _uiState.value.copy(showCreateDialog = false)
    }

    fun createCharacter(name: String, onSuccess: (Int) -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCreating = true, error = null)
            val data = CharacterData(character_name = name)
            when (val result = characterRepository.createCharacter(name, data)) {
                is Result.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isCreating = false,
                        showCreateDialog = false
                    )
                    refreshCharacters()
                    onSuccess(result.data)
                }
                is Result.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isCreating = false,
                        error = result.message
                    )
                }
                is Result.Loading -> {}
            }
        }
    }

    fun deleteCharacter(id: Int) {
        viewModelScope.launch {
            when (val result = characterRepository.deleteCharacter(id)) {
                is Result.Success -> refreshCharacters()
                is Result.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is Result.Loading -> {}
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
