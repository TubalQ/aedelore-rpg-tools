package nu.aedelore.app.data.remote.dto.campaign

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class PlayerCampaignListItem(
    val id: Int,
    val name: String,
    val description: String? = null,
    @SerialName("dm_name") val dmName: String? = null,
    @SerialName("session_count") val sessionCount: Int = 0
)

@Serializable
data class PlayerCampaignDetail(
    val campaign: CampaignBasic? = null,
    @SerialName("locked_sessions") val lockedSessions: List<SessionSummary> = emptyList(),
    @SerialName("latest_session") val latestSession: SessionSummary? = null,
    val error: String? = null
)

@Serializable
data class CampaignBasic(
    val id: Int,
    val name: String,
    val description: String? = null,
    @SerialName("dm_name") val dmName: String? = null
)

@Serializable
data class SessionSummary(
    val id: Int,
    @SerialName("session_number") val sessionNumber: Int,
    val date: String? = null,
    val location: String? = null,
    val status: String? = null,
    val summary: SessionSummaryData? = null
)

@Serializable
data class SessionSummaryData(
    val hook: String? = null,
    val prolog: String? = null,
    val npcs: List<SummaryNpc> = emptyList(),
    val places: List<SummaryPlace> = emptyList(),
    val encounters: List<SummaryEncounter> = emptyList(),
    val items: List<SummaryItem> = emptyList(),
    @SerialName("read_aloud") val readAloud: List<SummaryReadAloud> = emptyList(),
    @SerialName("session_notes") val sessionNotes: SessionNotes? = null
)

@Serializable
data class SummaryNpc(
    val name: String = "",
    val role: String? = null,
    val description: String? = null,
    val disposition: String? = null
)

@Serializable
data class SummaryPlace(
    val name: String = "",
    val description: String? = null
)

@Serializable
data class SummaryEncounter(
    val name: String = "",
    val location: String? = null,
    val enemies: List<String> = emptyList(),
    val loot: String? = null
)

@Serializable
data class SummaryItem(
    val name: String = "",
    val description: String? = null,
    val location: String? = null
)

@Serializable
data class SummaryReadAloud(
    val title: String = "",
    val text: String? = null
)

@Serializable
data class SessionNotes(
    val followUp: String? = null
)

@Serializable
data class JoinCampaignRequest(
    @SerialName("share_code") val shareCode: String
)

@Serializable
data class JoinCampaignResponse(
    val success: Boolean = false,
    @SerialName("campaign_name") val campaignName: String? = null,
    @SerialName("campaign_id") val campaignId: Int? = null,
    val error: String? = null
)

@Serializable
data class CampaignPlayersResponse(
    val players: List<CampaignPlayerDto> = emptyList(),
    val isDM: Boolean = false,
    val error: String? = null
)

@Serializable
data class CampaignPlayerDto(
    val id: Int,
    val username: String,
    @SerialName("joined_at") val joinedAt: String? = null,
    val character: CampaignPlayerCharacter? = null
)

@Serializable
data class CampaignPlayerCharacter(
    val id: Int,
    val name: String,
    val race: String? = null,
    @SerialName("class") val characterClass: String? = null,
    val religion: String? = null,
    val xp: Int = 0,
    @SerialName("xp_spent") val xpSpent: Int = 0,
    @SerialName("race_class_locked") val raceClassLocked: Boolean = false,
    @SerialName("attributes_locked") val attributesLocked: Boolean = false,
    @SerialName("abilities_locked") val abilitiesLocked: Boolean = false
)
