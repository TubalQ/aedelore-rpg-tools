package nu.aedelore.app.data.repository

import nu.aedelore.app.data.remote.api.WikiApi
import nu.aedelore.app.domain.repository.WikiRepository
import nu.aedelore.app.domain.repository.WikiResult
import nu.aedelore.app.util.Result
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WikiRepositoryImpl @Inject constructor(
    private val wikiApi: WikiApi,
) : WikiRepository {

    override suspend fun search(query: String): Result<List<WikiResult>> {
        return try {
            val response = wikiApi.search(query)
            if (response.isSuccessful) {
                val results = response.body()?.results ?: emptyList()
                Result.Success(results.map {
                    WikiResult(
                        title = it.title,
                        url = "https://aedelore.nu/wiki/${it.bookSlug}/${it.slug}",
                        excerpt = it.summary ?: it.chapterTitle ?: "",
                    )
                })
            } else {
                Result.Error("Search failed")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }
}
