package nu.aedelore.app.domain.repository

import nu.aedelore.app.util.Result

data class WikiResult(
    val title: String,
    val url: String,
    val excerpt: String
)

interface WikiRepository {
    suspend fun search(query: String): Result<List<WikiResult>>
}
