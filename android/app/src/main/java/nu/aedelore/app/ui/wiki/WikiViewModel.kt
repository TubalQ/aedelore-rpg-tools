package nu.aedelore.app.ui.wiki

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
import nu.aedelore.app.domain.repository.WikiRepository
import nu.aedelore.app.domain.repository.WikiResult
import nu.aedelore.app.util.Result
import javax.inject.Inject

data class WikiUiState(
    val query: String = "",
    val results: List<WikiResult> = emptyList(),
    val isSearching: Boolean = false,
    val error: String? = null,
)

@HiltViewModel
class WikiViewModel @Inject constructor(
    private val wikiRepository: WikiRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(WikiUiState())
    val uiState: StateFlow<WikiUiState> = _uiState.asStateFlow()

    private var searchJob: Job? = null

    fun onQueryChanged(query: String) {
        _uiState.update { it.copy(query = query) }
        searchJob?.cancel()
        if (query.length < 2) {
            _uiState.update { it.copy(results = emptyList(), isSearching = false) }
            return
        }
        searchJob = viewModelScope.launch {
            delay(300) // debounce
            _uiState.update { it.copy(isSearching = true, error = null) }
            when (val result = wikiRepository.search(query)) {
                is Result.Success -> {
                    _uiState.update { it.copy(results = result.data, isSearching = false) }
                }
                is Result.Error -> {
                    _uiState.update { it.copy(error = result.message, isSearching = false) }
                }
                is Result.Loading -> {}
            }
        }
    }

    fun clearSearch() {
        searchJob?.cancel()
        _uiState.update { WikiUiState() }
    }
}
