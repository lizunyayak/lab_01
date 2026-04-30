export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Система опитування групи — API',
    version: '0.2.0',
    description: 'REST API для управління опитуваннями, питаннями та відповідями'
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local dev' }],
  tags: [
    { name: 'Users', description: 'Управління користувачами' },
    { name: 'Polls', description: 'Управління опитуваннями' },
    { name: 'Questions', description: 'Питання всередині опитувань' },
    { name: 'Responses', description: 'Відповіді учасників' }
  ],
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid request body' },
              details: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      },
      UserResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Іван Петренко' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateUserRequest: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', minLength: 2, example: 'Іван Петренко' },
          email: { type: 'string', format: 'email', example: 'ivan@example.com' }
        }
      },
      UpdateUserRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' }
        }
      },
      PollResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          endDate: { type: 'string', format: 'date', example: '2025-12-31' },
          visibility: { type: 'string', enum: ['public', 'private', 'restricted'] },
          authorId: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CreatePollRequest: {
        type: 'object',
        required: ['title', 'endDate', 'visibility', 'authorId'],
        properties: {
          title: { type: 'string', minLength: 3, example: 'Задоволеність навчанням' },
          description: { type: 'string', example: 'Опитування по кінцю семестру' },
          endDate: { type: 'string', format: 'date', example: '2025-12-31' },
          visibility: { type: 'string', enum: ['public', 'private', 'restricted'] },
          authorId: { type: 'string', format: 'uuid' }
        }
      },
      UpdatePollRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3 },
          description: { type: 'string' },
          endDate: { type: 'string', format: 'date' },
          visibility: { type: 'string', enum: ['public', 'private', 'restricted'] }
        }
      },
      QuestionResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          pollId: { type: 'string', format: 'uuid' },
          text: { type: 'string' },
          order: { type: 'integer', minimum: 1 },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateQuestionRequest: {
        type: 'object',
        required: ['pollId', 'text'],
        properties: {
          pollId: { type: 'string', format: 'uuid' },
          text: { type: 'string', minLength: 3, example: 'Чи задоволені ви якістю лекцій?' },
          order: { type: 'integer', minimum: 1 }
        }
      },
      ResponseResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          pollId: { type: 'string', format: 'uuid' },
          questionId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          answer: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateResponseRequest: {
        type: 'object',
        required: ['pollId', 'questionId', 'userId', 'answer'],
        properties: {
          pollId: { type: 'string', format: 'uuid' },
          questionId: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          answer: { type: 'string', example: 'Так, дуже задоволений' }
        }
      },
      PagedList: {
        type: 'object',
        properties: {
          items: { type: 'array' },
          total: { type: 'integer' },
          page: { type: 'integer' },
          pageSize: { type: 'integer' }
        }
      }
    },
    parameters: {
      id: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' }
      },
      page: { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
      pageSize: { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } },
      sortDir: { name: 'sortDir', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } }
    }
  },
  paths: {
    // ── USERS ──────────────────────────────────────────────────────────────
    '/api/users': {
      get: {
        tags: ['Users'], summary: 'Список користувачів',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/pageSize' },
          { $ref: '#/components/parameters/sortDir' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['name', 'email', 'createdAt'] } }
        ],
        responses: { '200': { description: 'OK' } }
      },
      post: {
        tags: ['Users'], summary: 'Створити користувача',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserRequest' } } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Validation error' }, '409': { description: 'Email conflict' } }
      }
    },
    '/api/users/{id}': {
      get: { tags: ['Users'], summary: 'Отримати за ID', parameters: [{ $ref: '#/components/parameters/id' }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      put: { tags: ['Users'], summary: 'Замінити', parameters: [{ $ref: '#/components/parameters/id' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } } }, responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      patch: { tags: ['Users'], summary: 'Часткове оновлення', parameters: [{ $ref: '#/components/parameters/id' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } } }, responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      delete: { tags: ['Users'], summary: 'Видалити', parameters: [{ $ref: '#/components/parameters/id' }], responses: { '204': { description: 'No Content' }, '404': { description: 'Not found' } } }
    },
    // ── POLLS ──────────────────────────────────────────────────────────────
    '/api/polls': {
      get: {
        tags: ['Polls'], summary: 'Список опитувань',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/pageSize' },
          { $ref: '#/components/parameters/sortDir' },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['title', 'endDate', 'createdAt'] } },
          { name: 'visibility', in: 'query', schema: { type: 'string', enum: ['public', 'private', 'restricted'] } },
          { name: 'authorId', in: 'query', schema: { type: 'string', format: 'uuid' } }
        ],
        responses: { '200': { description: 'OK' } }
      },
      post: {
        tags: ['Polls'], summary: 'Створити опитування',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePollRequest' } } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Validation error' } }
      }
    },
    '/api/polls/{id}': {
      get: { tags: ['Polls'], summary: 'Отримати за ID', parameters: [{ $ref: '#/components/parameters/id' }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      put: { tags: ['Polls'], summary: 'Замінити', parameters: [{ $ref: '#/components/parameters/id' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdatePollRequest' } } } }, responses: { '200': { description: 'OK' } } },
      patch: { tags: ['Polls'], summary: 'Часткове оновлення', parameters: [{ $ref: '#/components/parameters/id' }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdatePollRequest' } } } }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Polls'], summary: 'Видалити (+ каскадне видалення питань і відповідей)', parameters: [{ $ref: '#/components/parameters/id' }], responses: { '204': { description: 'No Content' } } }
    },
    // ── QUESTIONS ──────────────────────────────────────────────────────────
    '/api/questions': {
      get: {
        tags: ['Questions'], summary: 'Список питань',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/pageSize' },
          { name: 'pollId', in: 'query', schema: { type: 'string', format: 'uuid' } }
        ],
        responses: { '200': { description: 'OK' } }
      },
      post: {
        tags: ['Questions'], summary: 'Додати питання',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateQuestionRequest' } } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Validation error' } }
      }
    },
    '/api/questions/{id}': {
      get: { tags: ['Questions'], parameters: [{ $ref: '#/components/parameters/id' }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      put: { tags: ['Questions'], parameters: [{ $ref: '#/components/parameters/id' }], requestBody: { required: true, content: { 'application/json': { schema: {} } } }, responses: { '200': { description: 'OK' } } },
      patch: { tags: ['Questions'], parameters: [{ $ref: '#/components/parameters/id' }], requestBody: { required: true, content: { 'application/json': { schema: {} } } }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Questions'], parameters: [{ $ref: '#/components/parameters/id' }], responses: { '204': { description: 'No Content' } } }
    },
    // ── RESPONSES ──────────────────────────────────────────────────────────
    '/api/responses': {
      get: {
        tags: ['Responses'], summary: 'Список відповідей',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/pageSize' },
          { name: 'pollId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'userId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'questionId', in: 'query', schema: { type: 'string', format: 'uuid' } }
        ],
        responses: { '200': { description: 'OK' } }
      },
      post: {
        tags: ['Responses'], summary: 'Відправити відповідь',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateResponseRequest' } } } },
        responses: { '201': { description: 'Created' }, '400': { description: 'Validation error' }, '409': { description: 'Already answered' } }
      }
    },
    '/api/responses/{id}': {
      get: { tags: ['Responses'], parameters: [{ $ref: '#/components/parameters/id' }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } },
      put: { tags: ['Responses'], parameters: [{ $ref: '#/components/parameters/id' }], requestBody: { required: true, content: { 'application/json': { schema: {} } } }, responses: { '200': { description: 'OK' } } },
      patch: { tags: ['Responses'], parameters: [{ $ref: '#/components/parameters/id' }], requestBody: { required: true, content: { 'application/json': { schema: {} } } }, responses: { '200': { description: 'OK' } } },
      delete: { tags: ['Responses'], parameters: [{ $ref: '#/components/parameters/id' }], responses: { '204': { description: 'No Content' } } }
    }
  }
};
