package nu.aedelore.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import nu.aedelore.app.data.preferences.AppPreferences
import nu.aedelore.app.ui.navigation.AedeloreNavHost
import nu.aedelore.app.ui.theme.AedeloreTheme
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var appPreferences: AppPreferences

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val currentTheme by appPreferences.theme.collectAsState(initial = "aedelore")
            val coroutineScope = rememberCoroutineScope()

            AedeloreTheme(themeName = currentTheme) {
                AedeloreNavHost(
                    appPreferences = appPreferences,
                    currentTheme = currentTheme,
                    onThemeChanged = { theme ->
                        coroutineScope.launch {
                            appPreferences.setTheme(theme)
                        }
                    },
                )
            }
        }
    }
}
