package nu.aedelore.app.di

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import nu.aedelore.app.data.repository.AuthRepositoryImpl
import nu.aedelore.app.data.repository.CharacterRepositoryImpl
import nu.aedelore.app.data.repository.TrashRepositoryImpl
import nu.aedelore.app.data.repository.WikiRepositoryImpl
import nu.aedelore.app.domain.repository.AuthRepository
import nu.aedelore.app.domain.repository.CharacterRepository
import nu.aedelore.app.domain.repository.TrashRepository
import nu.aedelore.app.domain.repository.WikiRepository

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    abstract fun bindAuthRepository(impl: AuthRepositoryImpl): AuthRepository

    @Binds
    abstract fun bindCharacterRepository(impl: CharacterRepositoryImpl): CharacterRepository

    @Binds
    abstract fun bindTrashRepository(impl: TrashRepositoryImpl): TrashRepository

    @Binds
    abstract fun bindWikiRepository(impl: WikiRepositoryImpl): WikiRepository
}
