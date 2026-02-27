package nu.aedelore.app.data.remote.api

import nu.aedelore.app.data.remote.dto.auth.SuccessResponse
import nu.aedelore.app.data.remote.dto.trash.TrashCharacterItem
import retrofit2.Response
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface TrashApi {

    @GET("api/trash/characters")
    suspend fun getTrashCharacters(): Response<List<TrashCharacterItem>>

    @POST("api/trash/characters/{id}/restore")
    suspend fun restoreCharacter(@Path("id") id: Int): Response<SuccessResponse>

    @DELETE("api/trash/characters/{id}")
    suspend fun permanentDeleteCharacter(@Path("id") id: Int): Response<SuccessResponse>
}
