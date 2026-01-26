const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Aedelore API',
            version: '2.0.0',
            description: 'API for Aedelore RPG character sheets and DM tools',
            contact: {
                name: 'Aedelore',
                url: 'https://aedelore.nu'
            }
        },
        servers: [
            {
                url: '/api',
                description: 'API server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    description: 'JWT token from login'
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'auth_token',
                    description: 'httpOnly cookie set on login'
                },
                csrfToken: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-CSRF-Token',
                    description: 'CSRF token from csrf_token cookie'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', description: 'Error message' }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Character: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string', maxLength: 100 },
                        system: {
                            type: 'string',
                            enum: ['aedelore', 'dnd5e', 'pathfinder2e', 'storyteller', 'cod']
                        },
                        data: { type: 'object', description: 'Character sheet data' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Campaign: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string', maxLength: 100 },
                        description: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Session: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        campaign_id: { type: 'integer' },
                        session_number: { type: 'integer' },
                        date: { type: 'string' },
                        location: { type: 'string' },
                        status: { type: 'string', enum: ['planning', 'active', 'completed'] },
                        data: { type: 'object', description: 'Session data (encounters, places, notes)' }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Characters', description: 'Character management' },
            { name: 'Campaigns', description: 'Campaign management' },
            { name: 'Sessions', description: 'DM session management' },
            { name: 'DM', description: 'DM tools (codes, shared sessions)' },
            { name: 'Trash', description: 'Soft-deleted items' }
        ]
    },
    apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
