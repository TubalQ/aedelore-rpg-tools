package nu.aedelore.app.ui.trash

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import nu.aedelore.app.domain.repository.TrashCharacter
import nu.aedelore.app.domain.repository.TrashRepository
import nu.aedelore.app.util.Result
import javax.inject.Inject

data class TrashUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val characters: List<TrashCharacter> = emptyList()
)

@HiltViewModel
class TrashViewModel @Inject constructor(
    private val trashRepository: TrashRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(TrashUiState())
    val uiState: StateFlow<TrashUiState> = _uiState.asStateFlow()

    init {
        loadTrash()
    }

    fun loadTrash() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = trashRepository.getTrashCharacters()) {
                is Result.Success -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        characters = result.data
                    )
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

    fun restoreCharacter(id: Int) {
        viewModelScope.launch {
            when (trashRepository.restoreCharacter(id)) {
                is Result.Success -> loadTrash()
                is Result.Error -> {}
                is Result.Loading -> {}
            }
        }
    }

    fun permanentDelete(id: Int) {
        viewModelScope.launch {
            when (trashRepository.permanentDeleteCharacter(id)) {
                is Result.Success -> loadTrash()
                is Result.Error -> {}
                is Result.Loading -> {}
            }
        }
    }
}
