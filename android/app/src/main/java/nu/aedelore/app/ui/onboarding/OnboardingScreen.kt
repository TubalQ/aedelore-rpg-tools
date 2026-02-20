package nu.aedelore.app.ui.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch

data class OnboardingStep(
    val title: String,
    val description: String,
)

private val onboardingSteps = listOf(
    OnboardingStep(
        title = "Welcome to Aedelore",
        description = "Create and manage your characters for the Aedelore tabletop RPG system. This guide will walk you through the basics.",
    ),
    OnboardingStep(
        title = "Create a Character",
        description = "Tap the + button on the character list to create a new character. Give them a name to get started.",
    ),
    OnboardingStep(
        title = "Choose Race & Class",
        description = "On the Character tab, select a race and class. Bonuses will be auto-filled, and your starting equipment will be set up automatically.",
    ),
    OnboardingStep(
        title = "Distribute Attributes",
        description = "On the Stats tab, you have 10 free attribute points to distribute among 7 attributes: Strength, Dexterity, Toughness, Intelligence, Wisdom, Force of Will, and Third Eye.",
    ),
    OnboardingStep(
        title = "Choose Abilities",
        description = "On the Abilities tab, pick your spells or abilities. Mages and Druids get 10 spell slots with arcana costs. Other classes get 5 ability slots.",
    ),
    OnboardingStep(
        title = "Lock Your Choices",
        description = "Lock your race & class, then attributes, then abilities. Each lock is permanent and follows a specific order. Locking earns XP rewards!",
    ),
    OnboardingStep(
        title = "Equip Gear",
        description = "On the Combat tab, equip weapons, armor, and a shield. On the Gear tab, manage your inventory, currency, and consumables.",
    ),
    OnboardingStep(
        title = "Track Resources",
        description = "The Overview tab shows your key stats at a glance: HP, Arcana, Willpower, Bleed, and Weakened. The status bar at the bottom is always visible.",
    ),
    OnboardingStep(
        title = "Roll Dice",
        description = "The Tools tab has a dice roller with 4 modes: Successes (D10/D12/D20 pools), Initiative, Food & Water, and Arrows. Criticals explode!",
    ),
    OnboardingStep(
        title = "Join a Campaign",
        description = "Your DM can give you a campaign share code. Enter it on the Character tab to link your character and see your party members. Have fun adventuring!",
    ),
)

@Composable
fun OnboardingScreen(
    onFinish: () -> Unit,
) {
    val pagerState = rememberPagerState(pageCount = { onboardingSteps.size })
    val coroutineScope = rememberCoroutineScope()
    val isLastPage = pagerState.currentPage == onboardingSteps.size - 1

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
    ) {
        // Skip button
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End,
        ) {
            TextButton(onClick = onFinish) {
                Text("Skip")
            }
        }

        // Pager
        HorizontalPager(
            state = pagerState,
            modifier = Modifier.weight(1f),
        ) { page ->
            val step = onboardingSteps[page]
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text(
                    text = step.title,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.primary,
                )
                Spacer(modifier = Modifier.height(24.dp))
                Text(
                    text = step.description,
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onSurface,
                )
            }
        }

        // Page indicators
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            horizontalArrangement = Arrangement.Center,
        ) {
            repeat(onboardingSteps.size) { index ->
                Box(
                    modifier = Modifier
                        .padding(horizontal = 4.dp)
                        .size(if (index == pagerState.currentPage) 10.dp else 8.dp)
                        .clip(CircleShape)
                        .background(
                            if (index == pagerState.currentPage)
                                MaterialTheme.colorScheme.primary
                            else
                                MaterialTheme.colorScheme.outline
                        ),
                )
            }
        }

        // Navigation buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            if (pagerState.currentPage > 0) {
                OutlinedButton(
                    onClick = {
                        coroutineScope.launch {
                            pagerState.animateScrollToPage(pagerState.currentPage - 1)
                        }
                    },
                ) {
                    Text("Back")
                }
            } else {
                Spacer(modifier = Modifier.weight(1f))
            }

            Button(
                onClick = {
                    if (isLastPage) {
                        onFinish()
                    } else {
                        coroutineScope.launch {
                            pagerState.animateScrollToPage(pagerState.currentPage + 1)
                        }
                    }
                },
            ) {
                Text(if (isLastPage) "Get Started" else "Next")
            }
        }
    }
}
