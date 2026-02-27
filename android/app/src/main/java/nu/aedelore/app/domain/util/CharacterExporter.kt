package nu.aedelore.app.domain.util

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import nu.aedelore.app.domain.model.CharacterData

object CharacterExporter {

    private val json = Json {
        prettyPrint = true
        encodeDefaults = true
    }

    fun exportToJson(data: CharacterData): String {
        return json.encodeToString(data)
    }

    fun importFromJson(jsonString: String): CharacterData? {
        return try {
            val lenientJson = Json {
                ignoreUnknownKeys = true
                coerceInputValues = true
                isLenient = true
            }
            lenientJson.decodeFromString<CharacterData>(jsonString)
        } catch (e: Exception) {
            null
        }
    }
}
