package nu.aedelore.app.ui.navigation

sealed class Screen(val route: String) {
    data object Login : Screen("login")
    data object Register : Screen("register")
    data object ForgotPassword : Screen("forgot_password")
    data object ResetPassword : Screen("reset_password/{token}") {
        fun createRoute(token: String) = "reset_password/$token"
    }
    data object CharacterList : Screen("character_list")
    data object CharacterSheet : Screen("character_sheet/{characterId}") {
        fun createRoute(characterId: Int) = "character_sheet/$characterId"
    }
    data object Settings : Screen("settings")
    data object Account : Screen("account")
    data object Trash : Screen("trash")
    data object Onboarding : Screen("onboarding")
}
