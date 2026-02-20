package nu.aedelore.app.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "characters")
data class CharacterEntity(
    @PrimaryKey val id: Int,
    val name: String,
    val system: String = "aedelore",
    @ColumnInfo(name = "data_json") val dataJson: String? = null,
    val xp: Int = 0,
    @ColumnInfo(name = "xp_spent") val xpSpent: Int = 0,
    @ColumnInfo(name = "race_class_locked") val raceClassLocked: Boolean = false,
    @ColumnInfo(name = "attributes_locked") val attributesLocked: Boolean = false,
    @ColumnInfo(name = "abilities_locked") val abilitiesLocked: Boolean = false,
    @ColumnInfo(name = "campaign_id") val campaignId: Int? = null,
    @ColumnInfo(name = "campaign_name") val campaignName: String? = null,
    @ColumnInfo(name = "updated_at") val updatedAt: String? = null,
    @ColumnInfo(name = "is_dirty") val isDirty: Boolean = false
)
