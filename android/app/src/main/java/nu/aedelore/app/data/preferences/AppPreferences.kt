package nu.aedelore.app.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "aedelore_prefs")

class AppPreferences(private val context: Context) {

    companion object {
        val THEME_KEY = stringPreferencesKey("theme")
        val ONBOARDING_DISMISSED_KEY = booleanPreferencesKey("onboarding_dismissed")
        val LAST_CHARACTER_ID_KEY = intPreferencesKey("last_character_id")
    }

    val theme: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[THEME_KEY] ?: "aedelore"
    }

    val onboardingDismissed: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[ONBOARDING_DISMISSED_KEY] ?: false
    }

    val lastCharacterId: Flow<Int?> = context.dataStore.data.map { prefs ->
        prefs[LAST_CHARACTER_ID_KEY]
    }

    suspend fun setTheme(theme: String) {
        context.dataStore.edit { it[THEME_KEY] = theme }
    }

    suspend fun dismissOnboarding() {
        context.dataStore.edit { it[ONBOARDING_DISMISSED_KEY] = true }
    }

    suspend fun setLastCharacterId(id: Int) {
        context.dataStore.edit { it[LAST_CHARACTER_ID_KEY] = id }
    }
}
