package nu.aedelore.app.data.remote.api

import nu.aedelore.app.data.remote.dto.auth.SuccessResponse
import nu.aedelore.app.data.remote.dto.character.ArchiveItemRequest
import nu.aedelore.app.data.remote.dto.character.CharacterCreateRequest
import nu.aedelore.app.data.remote.dto.character.CharacterCreateResponse
import nu.aedelore.app.data.remote.dto.character.CharacterDetailResponse
import nu.aedelore.app.data.remote.dto.character.CharacterListItem
import nu.aedelore.app.data.remote.dto.character.CharacterUpdateRequest
import nu.aedelore.app.data.remote.dto.character.LinkCampaignRequest
import nu.aedelore.app.data.remote.dto.character.LinkCampaignResponse
import nu.aedelore.app.data.remote.dto.character.LockResponse
import nu.aedelore.app.data.remote.dto.character.PartyResponse
import nu.aedelore.app.data.remote.dto.character.QuestItemsResponse
import nu.aedelore.app.data.remote.dto.character.SpendPointsRequest
import nu.aedelore.app.data.remote.dto.character.SpendPointsResponse
import nu.aedelore.app.data.remote.dto.character.UnarchiveItemRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface CharacterApi {

    @GET("api/characters")
    suspend fun getCharacters(): Response<List<CharacterListItem>>

    @GET("api/characters/{id}")
    suspend fun getCharacter(@Path("id") id: Int): Response<CharacterDetailResponse>

    @POST("api/characters")
    suspend fun createCharacter(@Body request: CharacterCreateRequest): Response<CharacterCreateResponse>

    @PUT("api/characters/{id}")
    suspend fun updateCharacter(
        @Path("id") id: Int,
        @Body request: CharacterUpdateRequest
    ): Response<CharacterCreateResponse>

    @DELETE("api/characters/{id}")
    suspend fun deleteCharacter(@Path("id") id: Int): Response<SuccessResponse>

    @POST("api/characters/{id}/link-campaign")
    suspend fun linkCampaign(
        @Path("id") id: Int,
        @Body request: LinkCampaignRequest
    ): Response<LinkCampaignResponse>

    @DELETE("api/characters/{id}/link-campaign")
    suspend fun unlinkCampaign(@Path("id") id: Int): Response<SuccessResponse>

    @GET("api/characters/{id}/party")
    suspend fun getParty(@Path("id") id: Int): Response<PartyResponse>

    @POST("api/characters/{id}/lock-race-class")
    suspend fun lockRaceClass(@Path("id") id: Int): Response<LockResponse>

    @POST("api/characters/{id}/lock-attributes")
    suspend fun lockAttributes(@Path("id") id: Int): Response<LockResponse>

    @POST("api/characters/{id}/lock-abilities")
    suspend fun lockAbilities(@Path("id") id: Int): Response<LockResponse>

    @POST("api/characters/{id}/spend-attribute-points")
    suspend fun spendAttributePoints(
        @Path("id") id: Int,
        @Body request: SpendPointsRequest
    ): Response<SpendPointsResponse>

    @POST("api/characters/{id}/archive-item")
    suspend fun archiveItem(
        @Path("id") id: Int,
        @Body request: ArchiveItemRequest
    ): Response<QuestItemsResponse>

    @POST("api/characters/{id}/unarchive-item")
    suspend fun unarchiveItem(
        @Path("id") id: Int,
        @Body request: UnarchiveItemRequest
    ): Response<QuestItemsResponse>
}
