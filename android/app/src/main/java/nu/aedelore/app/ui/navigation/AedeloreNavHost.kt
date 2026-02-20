package nu.aedelore.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import kotlinx.coroutines.launch
import nu.aedelore.app.data.preferences.AppPreferences
import nu.aedelore.app.ui.auth.AccountScreen
import nu.aedelore.app.ui.auth.AuthViewModel
import nu.aedelore.app.ui.auth.ForgotPasswordScreen
import nu.aedelore.app.ui.auth.LoginScreen
import nu.aedelore.app.ui.auth.RegisterScreen
import nu.aedelore.app.ui.auth.ResetPasswordScreen
import nu.aedelore.app.ui.characterlist.CharacterListScreen
import nu.aedelore.app.ui.characterlist.CharacterListViewModel
import nu.aedelore.app.ui.onboarding.OnboardingScreen
import nu.aedelore.app.ui.settings.SettingsScreen
import nu.aedelore.app.ui.sheet.CharacterSheetScreen
import nu.aedelore.app.ui.trash.TrashScreen
import nu.aedelore.app.ui.trash.TrashViewModel

@Composable
fun AedeloreNavHost(
    navController: NavHostController = rememberNavController(),
    authViewModel: AuthViewModel = hiltViewModel(),
    appPreferences: AppPreferences,
    currentTheme: String,
    onThemeChanged: (String) -> Unit,
) {
    val isLoggedIn by authViewModel.isLoggedIn.collectAsState(initial = false)
    val onboardingDismissed by appPreferences.onboardingDismissed.collectAsState(initial = true)
    val coroutineScope = rememberCoroutineScope()

    val startDestination = when {
        !isLoggedIn -> Screen.Login.route
        !onboardingDismissed -> Screen.Onboarding.route
        else -> Screen.CharacterList.route
    }

    NavHost(
        navController = navController,
        startDestination = startDestination,
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                viewModel = authViewModel,
                onLoginSuccess = {
                    navController.navigate(Screen.CharacterList.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate(Screen.Register.route)
                },
                onNavigateToForgotPassword = {
                    navController.navigate(Screen.ForgotPassword.route)
                },
            )
        }

        composable(Screen.Register.route) {
            RegisterScreen(
                viewModel = authViewModel,
                onRegisterSuccess = {
                    navController.navigate(Screen.CharacterList.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() },
            )
        }

        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                viewModel = authViewModel,
                onNavigateBack = { navController.popBackStack() },
            )
        }

        composable(
            route = Screen.ResetPassword.route,
            arguments = listOf(
                navArgument("token") { type = NavType.StringType }
            ),
        ) { backStackEntry ->
            val token = backStackEntry.arguments?.getString("token") ?: ""
            ResetPasswordScreen(
                viewModel = authViewModel,
                token = token,
                onResetSuccess = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() },
            )
        }

        composable(Screen.Onboarding.route) {
            OnboardingScreen(
                onFinish = {
                    coroutineScope.launch { appPreferences.dismissOnboarding() }
                    navController.navigate(Screen.CharacterList.route) {
                        popUpTo(Screen.Onboarding.route) { inclusive = true }
                    }
                },
            )
        }

        composable(Screen.CharacterList.route) {
            val listViewModel: CharacterListViewModel = hiltViewModel()
            CharacterListScreen(
                viewModel = listViewModel,
                onCharacterClick = { id ->
                    navController.navigate(Screen.CharacterSheet.createRoute(id))
                },
                onNavigateToSettings = {
                    navController.navigate(Screen.Settings.route)
                },
                onNavigateToAccount = {
                    navController.navigate(Screen.Account.route)
                },
                onNavigateToTrash = {
                    navController.navigate(Screen.Trash.route)
                },
            )
        }

        composable(
            route = Screen.CharacterSheet.route,
            arguments = listOf(
                navArgument("characterId") { type = NavType.IntType }
            ),
        ) {
            CharacterSheetScreen(
                onNavigateBack = { navController.popBackStack() },
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                currentTheme = currentTheme,
                onThemeSelected = onThemeChanged,
                onNavigateBack = { navController.popBackStack() },
            )
        }

        composable(Screen.Account.route) {
            AccountScreen(
                viewModel = authViewModel,
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onAccountDeleted = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() },
            )
        }

        composable(Screen.Trash.route) {
            val trashViewModel: TrashViewModel = hiltViewModel()
            TrashScreen(
                viewModel = trashViewModel,
                onNavigateBack = { navController.popBackStack() },
            )
        }
    }
}
