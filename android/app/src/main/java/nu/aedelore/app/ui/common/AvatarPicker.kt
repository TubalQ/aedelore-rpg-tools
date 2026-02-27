package nu.aedelore.app.ui.common

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

data class AvatarOption(
    val id: String,
    val emoji: String,
    val label: String,
)

private val avatarOptions = listOf(
    AvatarOption("warrior", "\u2694\uFE0F", "Warrior"),
    AvatarOption("mage", "\u2728", "Mage"),
    AvatarOption("rogue", "\uD83D\uDDE1\uFE0F", "Rogue"),
    AvatarOption("ranger", "\uD83C\uDFF9", "Ranger"),
    AvatarOption("cleric", "\u2695\uFE0F", "Cleric"),
    AvatarOption("druid", "\uD83C\uDF3F", "Druid"),
    AvatarOption("knight", "\uD83D\uDEE1\uFE0F", "Knight"),
    AvatarOption("skull", "\uD83D\uDC80", "Dark"),
    AvatarOption("crown", "\uD83D\uDC51", "Royal"),
    AvatarOption("fire", "\uD83D\uDD25", "Fire"),
    AvatarOption("ice", "\u2744\uFE0F", "Ice"),
    AvatarOption("moon", "\uD83C\uDF19", "Moon"),
)

@Composable
fun AvatarPicker(
    selectedAvatarId: String?,
    onAvatarSelected: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Choose Avatar") },
        text = {
            LazyVerticalGrid(
                columns = GridCells.Fixed(4),
                contentPadding = PaddingValues(4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(avatarOptions) { avatar ->
                    val isSelected = avatar.id == selectedAvatarId
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier
                            .clickable { onAvatarSelected(avatar.id) }
                            .padding(4.dp),
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(
                                    if (isSelected)
                                        MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                                    else
                                        MaterialTheme.colorScheme.surfaceVariant
                                )
                                .then(
                                    if (isSelected) Modifier.border(
                                        2.dp,
                                        MaterialTheme.colorScheme.primary,
                                        CircleShape
                                    )
                                    else Modifier
                                ),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(
                                text = avatar.emoji,
                                fontSize = 24.sp,
                            )
                        }
                        Text(
                            text = avatar.label,
                            style = MaterialTheme.typography.labelSmall,
                            textAlign = TextAlign.Center,
                            maxLines = 1,
                        )
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        },
    )
}

@Composable
fun AvatarDisplay(
    avatarId: String?,
    modifier: Modifier = Modifier,
    size: Int = 64,
) {
    val avatar = avatarOptions.find { it.id == avatarId }
    Box(
        modifier = modifier
            .size(size.dp)
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.surfaceVariant),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = avatar?.emoji ?: "\uD83D\uDC64",
            fontSize = (size * 0.5f).sp,
        )
    }
}
