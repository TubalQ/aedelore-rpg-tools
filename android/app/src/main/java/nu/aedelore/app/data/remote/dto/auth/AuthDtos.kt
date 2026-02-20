package nu.aedelore.app.data.remote.dto.auth

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LoginRequest(
    val username: String,
    val password: String
)

@Serializable
data class RegisterRequest(
    val username: String,
    val password: String,
    val email: String? = null
)

@Serializable
data class LoginResponse(
    val token: String? = null,
    val error: String? = null
)

@Serializable
data class MeResponse(
    val id: Int,
    val username: String,
    val email: String? = null,
    val error: String? = null
)

@Serializable
data class SuccessResponse(
    val success: Boolean = false,
    val message: String? = null,
    val error: String? = null
)

@Serializable
data class ChangePasswordRequest(
    @SerialName("currentPassword") val currentPassword: String,
    @SerialName("newPassword") val newPassword: String
)

@Serializable
data class ChangeEmailRequest(
    val email: String,
    val password: String
)

@Serializable
data class AccountDeleteRequest(
    val password: String
)

@Serializable
data class ForgotPasswordRequest(
    val email: String
)

@Serializable
data class ResetPasswordRequest(
    val token: String,
    val newPassword: String
)

@Serializable
data class TokenValidateResponse(
    val valid: Boolean,
    val error: String? = null
)
