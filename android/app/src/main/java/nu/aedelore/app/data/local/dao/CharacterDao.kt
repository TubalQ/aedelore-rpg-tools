package nu.aedelore.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow
import nu.aedelore.app.data.local.entity.CharacterEntity

@Dao
interface CharacterDao {
    @Query("SELECT * FROM characters ORDER BY updated_at DESC")
    fun getAllCharacters(): Flow<List<CharacterEntity>>

    @Query("SELECT * FROM characters WHERE id = :id")
    suspend fun getCharacterById(id: Int): CharacterEntity?

    @Query("SELECT * FROM characters WHERE id = :id")
    fun observeCharacter(id: Int): Flow<CharacterEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCharacter(character: CharacterEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCharacters(characters: List<CharacterEntity>)

    @Update
    suspend fun updateCharacter(character: CharacterEntity)

    @Query("DELETE FROM characters WHERE id = :id")
    suspend fun deleteCharacter(id: Int)

    @Query("DELETE FROM characters")
    suspend fun deleteAll()

    @Query("SELECT * FROM characters WHERE is_dirty = 1")
    suspend fun getDirtyCharacters(): List<CharacterEntity>

    @Query("UPDATE characters SET is_dirty = 0 WHERE id = :id")
    suspend fun clearDirty(id: Int)

    @Query("UPDATE characters SET data_json = :dataJson, is_dirty = 1 WHERE id = :id")
    suspend fun updateData(id: Int, dataJson: String)
}
