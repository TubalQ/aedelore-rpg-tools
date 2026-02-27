package nu.aedelore.app.data.remote.dto.character

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

@Serializable
data class CharacterListItem(
    val id: Int,
    val name: String,
    val system: String = "aedelore",
    @SerialName("updated_at") val updatedAt: String? = null
)

@Serializable
data class CharacterDetailResponse(
    val id: Int,
    val name: String,
    @SerialName("user_id") val userId: Int,
    val system: String = "aedelore",
    val data: JsonObject? = null,
    val xp: Int = 0,
    @SerialName("xp_spent") val xpSpent: Int = 0,
    @SerialName("race_class_locked") val raceClassLocked: Boolean = false,
    @SerialName("attributes_locked") val attributesLocked: Boolean = false,
    @SerialName("abilities_locked") val abilitiesLocked: Boolean = false,
    @SerialName("campaign_id") val campaignId: Int? = null,
    @SerialName("deleted_at") val deletedAt: String? = null,
    @SerialName("created_at") val createdAt: String? = null,
    @SerialName("updated_at") val updatedAt: String? = null,
    val campaign: CampaignInfo? = null,
    val error: String? = null
)

@Serializable
data class CampaignInfo(
    val id: Int,
    val name: String,
    val description: String? = null,
    @SerialName("dm_name") val dmName: String? = null
)

@Serializable
data class CharacterCreateRequest(
    val name: String,
    val data: JsonObject,
    val system: String = "aedelore"
)

@Serializable
data class CharacterUpdateRequest(
    val name: String,
    val data: JsonObject,
    val system: String = "aedelore"
)

@Serializable
data class CharacterCreateResponse(
    val success: Boolean = false,
    val id: Int? = null,
    val error: String? = null
)

@Serializable
data class LinkCampaignRequest(
    @SerialName("share_code") val shareCode: String
)

@Serializable
data class LinkCampaignResponse(
    val success: Boolean = false,
    @SerialName("campaign_name") val campaignName: String? = null,
    @SerialName("campaign_id") val campaignId: Int? = null,
    val error: String? = null
)

@Serializable
data class PartyResponse(
    val party: List<PartyMemberDto> = emptyList(),
    val message: String? = null
)

@Serializable
data class PartyMemberDto(
    val id: Int,
    val name: String,
    val system: String? = null,
    @SerialName("player_name") val playerName: String? = null
)

@Serializable
data class LockResponse(
    val success: Boolean = false,
    val message: String? = null,
    val error: String? = null
)

@Serializable
data class SpendPointsRequest(
    val count: Int
)

@Serializable
data class SpendPointsResponse(
    val success: Boolean = false,
    val xp: Int = 0,
    @SerialName("xp_spent") val xpSpent: Int = 0,
    @SerialName("points_spent") val pointsSpent: Int = 0,
    @SerialName("available_points") val availablePoints: Int = 0,
    val error: String? = null
)

@Serializable
data class ArchiveItemRequest(
    val itemIndex: Int
)

@Serializable
data class UnarchiveItemRequest(
    val archiveIndex: Int
)

@Serializable
data class QuestItemsResponse(
    val success: Boolean = false,
    @SerialName("quest_items") val questItems: List<QuestItemDto> = emptyList(),
    @SerialName("quest_items_archived") val questItemsArchived: List<QuestItemDto> = emptyList(),
    val error: String? = null
)

@Serializable
data class QuestItemDto(
    val name: String = "",
    val description: String = "",
    val givenAt: String? = null,
    val sessionName: String? = null,
    val archivedAt: String? = null
)
