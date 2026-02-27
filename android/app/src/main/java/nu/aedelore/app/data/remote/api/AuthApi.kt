package nu.aedelore.app.data.remote.api

import nu.aedelore.app.data.remote.dto.auth.AccountDeleteRequest
import nu.aedelore.app.data.remote.dto.auth.ChangeEmailRequest
import nu.aedelore.app.data.remote.dto.auth.ChangePasswordRequest
import nu.aedelore.app.data.remote.dto.auth.ForgotPasswordRequest
import nu.aedelore.app.data.remote.dto.auth.LoginRequest
import nu.aedelore.app.data.remote.dto.auth.LoginResponse
import nu.aedelore.app.data.remote.dto.auth.MeResponse
import nu.aedelore.app.data.remote.dto.auth.RegisterRequest
import nu.aedelore.app.data.remote.dto.auth.ResetPasswordRequest
import nu.aedelore.app.data.remote.dto.auth.SuccessResponse
import nu.aedelore.app.data.remote.dto.auth.TokenValidateResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Query

interface AuthApi {

    @GET("api/csrf-token")
    suspend fun getCsrfToken(): Response<Unit>

    @GET("api/health")
    suspend fun health(): Response<Unit>

    @POST("api/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("api/register")
    suspend fun register(@Body request: RegisterRequest): Response<LoginResponse>

    @POST("api/logout")
    suspend fun logout(): Response<SuccessResponse>

    @GET("api/me")
    suspend fun me(): Response<MeResponse>

    @PUT("api/account/password")
    suspend fun changePassword(@Body request: ChangePasswordRequest): Response<SuccessResponse>

    @PUT("api/account/email")
    suspend fun changeEmail(@Body request: ChangeEmailRequest): Response<SuccessResponse>

    @DELETE("api/account")
    suspend fun deleteAccount(@Body request: AccountDeleteRequest): Response<SuccessResponse>

    @POST("api/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<SuccessResponse>

    @GET("api/reset-password/validate")
    suspend fun validateResetToken(@Query("token") token: String): Response<TokenValidateResponse>

    @POST("api/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<SuccessResponse>
}
