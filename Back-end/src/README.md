# Backend Source Structure

This backend is organized by layer:

- `config/`: environment and database setup.
- `controllers/`: HTTP request handlers. Controllers validate request shape, call services/models, and send responses.
- `middleware/`: Express middleware such as authentication and error handling.
- `models/`: Mongoose schemas and models only.
- `routes/`: Express routers. Public API paths should stay stable here.
- `scripts/`: one-off operational scripts and migrations.
- `services/`: reusable business and database operations used by controllers.
- `utils/`: small shared helpers.

Naming rules:

- Use plural route filenames: `bookRoutes.ts`, `expenseRoutes.ts`.
- Use singular model filenames: `Book.ts`, `User.ts`, `PartyOrder.ts`.
- Keep API paths stable when moving internal files.
- Do not add new models or business logic under old folders like `modules/`.
