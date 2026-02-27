package nu.aedelore.app.data.remote.interceptor

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl

class CookieJarImpl(context: Context) : CookieJar {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "aedelore_cookies",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
        val editor = prefs.edit()
        for (cookie in cookies) {
            val key = "${cookie.domain}|${cookie.name}"
            editor.putString(key, cookie.toString())
        }
        editor.apply()
    }

    override fun loadForRequest(url: HttpUrl): List<Cookie> {
        val cookies = mutableListOf<Cookie>()
        for ((key, value) in prefs.all) {
            val cookieString = value as? String ?: continue
            val cookie = Cookie.parse(url, cookieString)
            if (cookie != null && cookie.matches(url)) {
                cookies.add(cookie)
            }
        }
        return cookies
    }

    fun getCookie(name: String): String? {
        for ((key, value) in prefs.all) {
            if (key.endsWith("|$name")) {
                val cookieString = value as? String ?: continue
                // Parse "name=value; ..." format
                val parts = cookieString.split(";").firstOrNull()?.split("=", limit = 2)
                if (parts != null && parts.size == 2 && parts[0].trim() == name) {
                    return parts[1].trim()
                }
            }
        }
        return null
    }

    fun clear() {
        prefs.edit().clear().apply()
    }
}
