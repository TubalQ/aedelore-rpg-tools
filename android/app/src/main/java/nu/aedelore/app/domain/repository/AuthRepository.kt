package nu.aedelore.app.domain.repository

import nu.aedelore.app.domain.model.User
import nu.aedelore.app.util.Result

interface AuthRepository {
    suspend fun login(username: String, password: String): Result<User>
    suspend fun register(username: String, password: String, email: String?): Result<User>
    suspend fun logout(): Result<Unit>
    suspend fun validateSession(): Result<User>
    suspend fun changePassword(currentPassword: String, newPassword: String): Result<Unit>
    suspend fun changeEmail(email: String, password: String): Result<Unit>
    suspend fun deleteAccount(password: String): Result<Unit>
    suspend fun forgotPassword(email: String): Result<Unit>
    suspend fun validateResetToken(token: String): Result<Boolean>
    suspend fun resetPassword(token: String, newPassword: String): Result<Unit>
    suspend fun fetchCsrfToken(): Result<Unit>
    fun isLoggedIn(): Boolean
}
