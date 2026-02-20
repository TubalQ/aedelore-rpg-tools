package nu.aedelore.app.di

import android.content.Context
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import nu.aedelore.app.BuildConfig
import nu.aedelore.app.data.preferences.AuthPreferences
import nu.aedelore.app.data.remote.api.AuthApi
import nu.aedelore.app.data.remote.api.CampaignApi
import nu.aedelore.app.data.remote.api.CharacterApi
import nu.aedelore.app.data.remote.api.TrashApi
import nu.aedelore.app.data.remote.api.WikiApi
import nu.aedelore.app.data.remote.interceptor.AuthInterceptor
import nu.aedelore.app.data.remote.interceptor.CookieJarImpl
import nu.aedelore.app.data.remote.interceptor.CsrfInterceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideJson(): Json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        explicitNulls = false
        isLenient = true
    }

    @Provides
    @Singleton
    fun provideCookieJar(@ApplicationContext context: Context): CookieJarImpl {
        return CookieJarImpl(context)
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authPreferences: AuthPreferences,
        cookieJar: CookieJarImpl
    ): OkHttpClient {
        val builder = OkHttpClient.Builder()
            .cookieJar(cookieJar)
            .addInterceptor(AuthInterceptor(authPreferences))
            .addInterceptor(CsrfInterceptor(cookieJar))
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)

        if (BuildConfig.DEBUG) {
            builder.addInterceptor(
                HttpLoggingInterceptor().apply {
                    level = HttpLoggingInterceptor.Level.BODY
                }
            )
        }

        return builder.build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient, json: Json): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL + "/")
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi = retrofit.create(AuthApi::class.java)

    @Provides
    @Singleton
    fun provideCharacterApi(retrofit: Retrofit): CharacterApi = retrofit.create(CharacterApi::class.java)

    @Provides
    @Singleton
    fun provideCampaignApi(retrofit: Retrofit): CampaignApi = retrofit.create(CampaignApi::class.java)

    @Provides
    @Singleton
    fun provideTrashApi(retrofit: Retrofit): TrashApi = retrofit.create(TrashApi::class.java)

    @Provides
    @Singleton
    fun provideWikiApi(retrofit: Retrofit): WikiApi = retrofit.create(WikiApi::class.java)
}
