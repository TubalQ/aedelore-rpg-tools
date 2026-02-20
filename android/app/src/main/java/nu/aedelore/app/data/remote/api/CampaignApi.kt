package nu.aedelore.app.data.remote.api

import nu.aedelore.app.data.remote.dto.auth.SuccessResponse
import nu.aedelore.app.data.remote.dto.campaign.CampaignPlayersResponse
import nu.aedelore.app.data.remote.dto.campaign.JoinCampaignRequest
import nu.aedelore.app.data.remote.dto.campaign.JoinCampaignResponse
import nu.aedelore.app.data.remote.dto.campaign.PlayerCampaignDetail
import nu.aedelore.app.data.remote.dto.campaign.PlayerCampaignListItem
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface CampaignApi {

    @GET("api/player/campaigns")
    suspend fun getPlayerCampaigns(): Response<List<PlayerCampaignListItem>>

    @GET("api/player/campaigns/{id}")
    suspend fun getPlayerCampaignDetail(@Path("id") id: Int): Response<PlayerCampaignDetail>

    @POST("api/campaigns/join")
    suspend fun joinCampaign(@Body request: JoinCampaignRequest): Response<JoinCampaignResponse>

    @DELETE("api/campaigns/{id}/leave")
    suspend fun leaveCampaign(@Path("id") id: Int): Response<SuccessResponse>

    @GET("api/campaigns/{id}/players")
    suspend fun getCampaignPlayers(@Path("id") id: Int): Response<CampaignPlayersResponse>
}
