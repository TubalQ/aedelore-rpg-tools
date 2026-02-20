package nu.aedelore.app.data.remote.interceptor

import nu.aedelore.app.util.Constants
import okhttp3.Interceptor
import okhttp3.Response

class CsrfInterceptor(
    private val cookieJar: CookieJarImpl
) : Interceptor {

    private val exemptPaths = setOf(
        "/api/login",
        "/api/register",
        "/api/forgot-password",
        "/api/reset-password"
    )

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val method = request.method.uppercase()

        // Only add CSRF header for non-GET requests
        if (method == "GET" || method == "HEAD" || method == "OPTIONS") {
            return chain.proceed(request)
        }

        // Check if path is exempt
        val path = request.url.encodedPath
        if (exemptPaths.any { path.startsWith(it) }) {
            return chain.proceed(request)
        }

        // Get CSRF token from cookie and add as header
        val csrfToken = cookieJar.getCookie(Constants.CSRF_COOKIE_NAME)
        if (csrfToken != null) {
            val newRequest = request.newBuilder()
                .header(Constants.CSRF_HEADER_NAME, csrfToken)
                .build()
            return chain.proceed(newRequest)
        }

        return chain.proceed(request)
    }
}
