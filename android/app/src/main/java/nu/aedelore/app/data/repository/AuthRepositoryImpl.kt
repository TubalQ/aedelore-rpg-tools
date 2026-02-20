package nu.aedelore.app.data.repository

import nu.aedelore.app.data.preferences.AuthPreferences
import nu.aedelore.app.data.remote.api.AuthApi
import nu.aedelore.app.domain.model.User
import nu.aedelore.app.domain.repository.AuthRepository
import nu.aedelore.app.util.Result
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val authApi: AuthApi,
    private val authPreferences: AuthPreferences,
) : AuthRepository {

    override suspend fun fetchCsrfToken(): Result<Unit> {
        return try {
            val response = authApi.getCsrfToken()
            if (response.isSuccessful) Result.Success(Unit)
            else Result.Error("Failed to fetch CSRF token")
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun login(username: String, password: String): Result<User> {
        return try {
            val response = authApi.login(
                nu.aedelore.app.data.remote.dto.auth.LoginRequest(username, password)
            )
            if (response.isSuccessful) {
                val body = response.body()
                val token = body?.token
                if (token != null) {
                    // Get user info
                    authPreferences.saveAuth(token, -1, username)
                    val meResponse = authApi.me()
                    if (meResponse.isSuccessful) {
                        val me = meResponse.body()!!
                        authPreferences.saveAuth(token, me.id, me.username)
                        Result.Success(User(id = me.id, username = me.username, email = me.email))
                    } else {
                        Result.Success(User(id = -1, username = username, email = null))
                    }
                } else {
                    Result.Error(body?.error ?: "Login failed")
                }
            } else {
                Result.Error("Login failed: ${response.code()}")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun register(username: String, password: String, email: String?): Result<User> {
        return try {
            val response = authApi.register(
                nu.aedelore.app.data.remote.dto.auth.RegisterRequest(username, password, email)
            )
            if (response.isSuccessful) {
                val body = response.body()
                val token = body?.token
                if (token != null) {
                    authPreferences.saveAuth(token, -1, username)
                    val meResponse = authApi.me()
                    if (meResponse.isSuccessful) {
                        val me = meResponse.body()!!
                        authPreferences.saveAuth(token, me.id, me.username)
                        Result.Success(User(id = me.id, username = me.username, email = me.email))
                    } else {
                        Result.Success(User(id = -1, username = username, email = null))
                    }
                } else {
                    Result.Error(body?.error ?: "Registration failed")
                }
            } else {
                Result.Error("Registration failed: ${response.code()}")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun logout(): Result<Unit> {
        return try {
            authApi.logout()
            authPreferences.clearSync()
            Result.Success(Unit)
        } catch (e: Exception) {
            authPreferences.clearSync()
            Result.Success(Unit)
        }
    }

    override suspend fun validateSession(): Result<User> {
        return try {
            val response = authApi.me()
            if (response.isSuccessful) {
                val me = response.body()!!
                Result.Success(User(id = me.id, username = me.username, email = me.email))
            } else {
                authPreferences.clearSync()
                Result.Error("Session expired")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun changePassword(currentPassword: String, newPassword: String): Result<Unit> {
        return try {
            val response = authApi.changePassword(
                nu.aedelore.app.data.remote.dto.auth.ChangePasswordRequest(currentPassword, newPassword)
            )
            if (response.isSuccessful) Result.Success(Unit)
            else Result.Error(response.body()?.error ?: "Failed to change password")
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun changeEmail(email: String, password: String): Result<Unit> {
        return try {
            val response = authApi.changeEmail(
                nu.aedelore.app.data.remote.dto.auth.ChangeEmailRequest(email, password)
            )
            if (response.isSuccessful) Result.Success(Unit)
            else Result.Error(response.body()?.error ?: "Failed to change email")
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun deleteAccount(password: String): Result<Unit> {
        return try {
            val response = authApi.deleteAccount(
                nu.aedelore.app.data.remote.dto.auth.AccountDeleteRequest(password)
            )
            if (response.isSuccessful) {
                authPreferences.clearSync()
                Result.Success(Unit)
            } else {
                Result.Error("Failed to delete account")
            }
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun forgotPassword(email: String): Result<Unit> {
        return try {
            val response = authApi.forgotPassword(
                nu.aedelore.app.data.remote.dto.auth.ForgotPasswordRequest(email)
            )
            if (response.isSuccessful) Result.Success(Unit)
            else Result.Error(response.body()?.error ?: "Failed")
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun validateResetToken(token: String): Result<Boolean> {
        return try {
            val response = authApi.validateResetToken(token)
            if (response.isSuccessful) Result.Success(response.body()?.valid ?: false)
            else Result.Error("Invalid token")
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override suspend fun resetPassword(token: String, newPassword: String): Result<Unit> {
        return try {
            val response = authApi.resetPassword(
                nu.aedelore.app.data.remote.dto.auth.ResetPasswordRequest(token, newPassword)
            )
            if (response.isSuccessful) Result.Success(Unit)
            else Result.Error(response.body()?.error ?: "Failed")
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    override fun isLoggedIn(): Boolean = authPreferences.getTokenSync() != null
}
