package nu.aedelore.app.data.remote.api

import nu.aedelore.app.data.remote.dto.wiki.WikiSearchResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

interface WikiApi {

    @GET("api/wiki/search")
    suspend fun search(@Query("q") query: String): Response<WikiSearchResponse>
}
