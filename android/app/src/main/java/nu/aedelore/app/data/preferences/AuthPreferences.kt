package nu.aedelore.app.data.preferences

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import nu.aedelore.app.util.Constants

class AuthPreferences(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "aedelore_auth",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private val _isLoggedIn = MutableStateFlow(getTokenSync() != null)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    fun saveAuth(token: String, userId: Int, username: String) {
        prefs.edit()
            .putString(Constants.TOKEN_KEY, token)
            .putInt(Constants.USER_ID_KEY, userId)
            .putString(Constants.USERNAME_KEY, username)
            .apply()
        _isLoggedIn.value = true
    }

    fun getTokenSync(): String? = prefs.getString(Constants.TOKEN_KEY, null)

    fun getUserId(): Int = prefs.getInt(Constants.USER_ID_KEY, -1)

    fun getUsername(): String? = prefs.getString(Constants.USERNAME_KEY, null)

    fun clearSync() {
        prefs.edit().clear().apply()
        _isLoggedIn.value = false
    }
}
