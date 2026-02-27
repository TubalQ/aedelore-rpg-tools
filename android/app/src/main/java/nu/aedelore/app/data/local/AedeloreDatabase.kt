package nu.aedelore.app.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import nu.aedelore.app.data.local.dao.CharacterDao
import nu.aedelore.app.data.local.entity.CharacterEntity

@Database(
    entities = [CharacterEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AedeloreDatabase : RoomDatabase() {
    abstract fun characterDao(): CharacterDao
}
