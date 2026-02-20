package nu.aedelore.app.util

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.emitAll
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map

inline fun <ResultType, RequestType> networkBoundResource(
    crossinline query: () -> Flow<ResultType>,
    crossinline fetch: suspend () -> RequestType,
    crossinline saveFetchResult: suspend (RequestType) -> Unit,
    crossinline shouldFetch: (ResultType?) -> Boolean = { true },
) = flow {
    emit(Result.Loading)
    val data = query().firstOrNull()
    if (shouldFetch(data)) {
        try {
            val response = fetch()
            saveFetchResult(response)
            emitAll(query().map { Result.Success(it) })
        } catch (e: Exception) {
            if (data != null) {
                emitAll(query().map { Result.Success(it) })
            } else {
                emit(Result.Error(e.message ?: "Unknown error"))
            }
        }
    } else {
        emitAll(query().map { Result.Success(it) })
    }
}
