package nu.aedelore.app.di

import android.content.Context
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import nu.aedelore.app.data.local.AedeloreDatabase
import nu.aedelore.app.data.local.dao.CharacterDao
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AedeloreDatabase {
        return Room.databaseBuilder(
            context,
            AedeloreDatabase::class.java,
            "aedelore.db"
        )
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    fun provideCharacterDao(database: AedeloreDatabase): CharacterDao {
        return database.characterDao()
    }
}
