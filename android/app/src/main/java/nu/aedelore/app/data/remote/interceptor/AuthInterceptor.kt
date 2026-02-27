package nu.aedelore.app.data.remote.interceptor

import nu.aedelore.app.data.preferences.AuthPreferences
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(
    private val authPreferences: AuthPreferences
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = authPreferences.getTokenSync()

        val request = if (token != null) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }

        val response = chain.proceed(request)

        // On 401, clear stored token
        if (response.code == 401) {
            authPreferences.clearSync()
        }

        return response
    }
}
