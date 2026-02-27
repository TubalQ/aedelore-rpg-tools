const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');

// Parse model config from env
function getModels() {
    try {
        return JSON.parse(process.env.AI_MODELS || '[]');
    } catch {
        return [];
    }
}

function getModelConfig(modelId) {
    const models = getModels();
    return models.find(m => m.id === modelId);
}

// Convert our tool format to Anthropic format
function toAnthropicTools(tools) {
    return tools.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: t.input_schema
    }));
}

// Convert our tool format to OpenAI format
function toOpenAITools(tools) {
    return tools.map(t => ({
        type: 'function',
        function: {
            name: t.name,
            description: t.description,
            parameters: t.input_schema
        }
    }));
}

// Convert our message format to Anthropic format
// Anthropic expects: [{role: 'user'|'assistant', content: string|array}]
// Tool results go as content blocks within user messages
function toAnthropicMessages(messages) {
    const result = [];
    let i = 0;

    while (i < messages.length) {
        const msg = messages[i];

        if (msg.role === 'user') {
            result.push({ role: 'user', content: msg.content });
        } else if (msg.role === 'assistant') {
            // Check if next messages are tool_call + tool_result pairs
            const contentBlocks = [];
            if (msg.content) {
                contentBlocks.push({ type: 'text', text: msg.content });
            }

            // Collect any tool_use blocks that follow
            let j = i + 1;
            while (j < messages.length && messages[j].role === 'tool_call') {
                const tc = messages[j];
                contentBlocks.push({
                    type: 'tool_use',
                    id: tc.tool_data.id,
                    name: tc.tool_data.name,
                    input: tc.tool_data.input
                });
                j++;
            }

            result.push({ role: 'assistant', content: contentBlocks.length > 0 ? contentBlocks : msg.content });

            // Now collect tool_result messages as a user message
            const toolResults = [];
            while (j < messages.length && messages[j].role === 'tool_result') {
                const tr = messages[j];
                toolResults.push({
                    type: 'tool_result',
                    tool_use_id: tr.tool_data.id,
                    content: typeof tr.tool_data.result === 'string'
                        ? tr.tool_data.result
                        : JSON.stringify(tr.tool_data.result)
                });
                j++;
            }

            if (toolResults.length > 0) {
                result.push({ role: 'user', content: toolResults });
            }

            i = j;
            continue;
        }
        // Handle orphaned tool_call messages (no preceding assistant message)
        // This can happen if the LLM calls tools without outputting text first
        if (msg.role === 'tool_call') {
            const contentBlocks = [];

            // Collect consecutive tool_call messages into one assistant message
            let j = i;
            while (j < messages.length && messages[j].role === 'tool_call') {
                const tc = messages[j];
                contentBlocks.push({
                    type: 'tool_use',
                    id: tc.tool_data.id,
                    name: tc.tool_data.name,
                    input: tc.tool_data.input
                });
                j++;
            }

            result.push({ role: 'assistant', content: contentBlocks });

            // Collect following tool_result messages as a user message
            const toolResults = [];
            while (j < messages.length && messages[j].role === 'tool_result') {
                const tr = messages[j];
                toolResults.push({
                    type: 'tool_result',
                    tool_use_id: tr.tool_data.id,
                    content: typeof tr.tool_data.result === 'string'
                        ? tr.tool_data.result
                        : JSON.stringify(tr.tool_data.result)
                });
                j++;
            }

            if (toolResults.length > 0) {
                result.push({ role: 'user', content: toolResults });
            }

            i = j;
            continue;
        }

        // Skip any other unexpected roles
        i++;
    }

    return result;
}

// Convert our message format to OpenAI format
function toOpenAIMessages(systemPrompt, messages) {
    const result = [{ role: 'system', content: systemPrompt }];

    for (const msg of messages) {
        if (msg.role === 'user') {
            result.push({ role: 'user', content: msg.content });
        } else if (msg.role === 'assistant') {
            result.push({ role: 'assistant', content: msg.content });
        } else if (msg.role === 'tool_call') {
            result.push({
                role: 'assistant',
                content: null,
                tool_calls: [{
                    id: msg.tool_data.id,
                    type: 'function',
                    function: {
                        name: msg.tool_data.name,
                        arguments: JSON.stringify(msg.tool_data.input)
                    }
                }]
            });
        } else if (msg.role === 'tool_result') {
            result.push({
                role: 'tool',
                tool_call_id: msg.tool_data.id,
                content: typeof msg.tool_data.result === 'string'
                    ? msg.tool_data.result
                    : JSON.stringify(msg.tool_data.result)
            });
        }
    }

    return result;
}

// Stream chat with Anthropic
async function* streamAnthropic(systemPrompt, messages, tools, modelName) {
    const client = new Anthropic();
    const anthropicMessages = toAnthropicMessages(messages);
    const anthropicTools = tools.length > 0 ? toAnthropicTools(tools) : undefined;

    const stream = client.messages.stream({
        model: modelName,
        max_tokens: 8192,
        system: systemPrompt,
        messages: anthropicMessages,
        tools: anthropicTools
    });

    let currentToolUse = null;
    let inputJsonStr = '';

    for await (const event of stream) {
        if (event.type === 'content_block_start') {
            if (event.content_block.type === 'text') {
                // Text block started
            } else if (event.content_block.type === 'tool_use') {
                currentToolUse = {
                    id: event.content_block.id,
                    name: event.content_block.name
                };
                inputJsonStr = '';
            }
        } else if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
                yield { type: 'text', content: event.delta.text };
            } else if (event.delta.type === 'input_json_delta') {
                inputJsonStr += event.delta.partial_json;
            }
        } else if (event.type === 'content_block_stop') {
            if (currentToolUse) {
                let input = {};
                try { input = JSON.parse(inputJsonStr); } catch {}
                yield {
                    type: 'tool_use',
                    id: currentToolUse.id,
                    name: currentToolUse.name,
                    input
                };
                currentToolUse = null;
                inputJsonStr = '';
            }
        } else if (event.type === 'message_delta') {
            if (event.usage) {
                yield {
                    type: 'usage',
                    input_tokens: 0,
                    output_tokens: event.usage.output_tokens
                };
            }
        } else if (event.type === 'message_start') {
            if (event.message?.usage) {
                yield {
                    type: 'usage',
                    input_tokens: event.message.usage.input_tokens,
                    output_tokens: 0
                };
            }
        }
    }

    yield { type: 'done' };
}

// Stream chat with OpenAI
async function* streamOpenAI(systemPrompt, messages, tools, modelName) {
    const client = new OpenAI();
    const openaiMessages = toOpenAIMessages(systemPrompt, messages);
    const openaiTools = tools.length > 0 ? toOpenAITools(tools) : undefined;

    const stream = await client.chat.completions.create({
        model: modelName,
        messages: openaiMessages,
        tools: openaiTools,
        stream: true,
        stream_options: { include_usage: true }
    });

    let currentToolCall = null;
    let argsStr = '';

    for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta;

        if (delta?.content) {
            yield { type: 'text', content: delta.content };
        }

        if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
                if (tc.id) {
                    // New tool call starting
                    if (currentToolCall) {
                        let input = {};
                        try { input = JSON.parse(argsStr); } catch {}
                        yield {
                            type: 'tool_use',
                            id: currentToolCall.id,
                            name: currentToolCall.name,
                            input
                        };
                    }
                    currentToolCall = { id: tc.id, name: tc.function?.name || '' };
                    argsStr = tc.function?.arguments || '';
                } else {
                    argsStr += tc.function?.arguments || '';
                }
            }
        }

        if (chunk.choices?.[0]?.finish_reason === 'tool_calls' && currentToolCall) {
            let input = {};
            try { input = JSON.parse(argsStr); } catch {}
            yield {
                type: 'tool_use',
                id: currentToolCall.id,
                name: currentToolCall.name,
                input
            };
            currentToolCall = null;
            argsStr = '';
        }

        if (chunk.usage) {
            yield {
                type: 'usage',
                input_tokens: chunk.usage.prompt_tokens || 0,
                output_tokens: chunk.usage.completion_tokens || 0
            };
        }
    }

    yield { type: 'done' };
}

// Main streaming function — picks provider based on model config
async function* streamChat(systemPrompt, messages, tools, modelId) {
    const config = getModelConfig(modelId);
    if (!config) {
        throw new Error(`Unknown model: ${modelId}`);
    }

    if (config.provider === 'anthropic') {
        yield* streamAnthropic(systemPrompt, messages, tools, config.model);
    } else if (config.provider === 'openai') {
        yield* streamOpenAI(systemPrompt, messages, tools, config.model);
    } else {
        throw new Error(`Unknown provider: ${config.provider}`);
    }
}

module.exports = { streamChat, getModels, getModelConfig };
