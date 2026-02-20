package nu.aedelore.app.data.remote.dto.wiki

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class WikiSearchResponse(
    val query: String = "",
    val results: List<WikiSearchResult> = emptyList()
)

@Serializable
data class WikiSearchResult(
    val id: Int,
    val slug: String,
    val title: String,
    val summary: String? = null,
    @SerialName("book_id") val bookId: Int = 0,
    @SerialName("book_title") val bookTitle: String = "",
    @SerialName("book_slug") val bookSlug: String = "",
    @SerialName("chapter_title") val chapterTitle: String? = null
)
