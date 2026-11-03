# Code conventions — API (NestJS) and website (React)

Rules for all new and changed code in this repo. Existing code that breaks them is
cleaned up under HEM-51; don't mix that cleanup into feature work.
ESLint and Prettier enforce part of this (`backend/eslint.config.mjs`, `frontend/eslint.config.js`).

## 1. REST API design

### URLs

- Every route is versioned: `/api/v1/...` (the `api` prefix comes from `PREFIX`, the version from
  `@Controller({ path, version: '1' })`).
- Resources are **plural, kebab-case nouns**: `/matches`, `/bug-reports`, `/fcm-tokens`.
- Nest child resources under their owner when they only exist in that context:
  `/matches/:matchId/events/:eventId`, `/matches/:matchId/invites`.
- Route params are camelCase and named after the resource: `:matchId`, `:userId` (not `:id`
  when a route has more than one id).
- The current user is `me`: `/users/me`, `/users/me/fcm-tokens`.
- Actions that aren't CRUD are a verb sub-resource with `POST`:
  `/matches/:matchId/leave`, `/matches/:matchId/events/:eventId/call`.
- Admin-only routes live under `/admin/...` and are guarded with `@Roles(Role.ADMIN)`.

### Methods and status codes

| Action | Method | Success |
|---|---|---|
| List / read | `GET` | `200` |
| Create | `POST` | `201` with the created resource |
| Replace / partial update | `PUT` / `PATCH` | `200` with the updated resource |
| Delete | `DELETE` | `204` (no body) |
| Action | `POST` | `200` with a result, or `204` |

Errors: `400` invalid input, `401` not authenticated, `403` authenticated but not allowed,
`404` not found **or** not visible to the caller, `409` conflict. Throw Nest's built-in
exceptions (`NotFoundException`, `ForbiddenException`, ...); the global filter turns them into
`{ statusCode, message, error }`.

### Bodies

- JSON fields are **camelCase**. Ids are exposed as `id` (string), never `_id`.
- Query parameters for filters and options (`GET /ads/random?placement=history`);
  never read a body on `GET`.
- Responses never contain other users' private fields (email, roles, FCM tokens) unless the
  caller is an admin. Use DTO mapping or Mongoose projections, not raw documents.
- Breaking changes to a response shape require a new API version or a coordinated change in
  the app and website under linked issues.

## 2. Backend structure (NestJS)

One folder per domain module:

```
src/<module>/
  <module>.module.ts
  <module>.controller.ts     HTTP only: routing, params, guards, mapping to DTOs
  <module>.service.ts        business rules; talks to repositories and other services
  <module>.repository.ts     the only place that uses the Mongoose model
  schemas/<entity>.schema.ts
  dto/<action>-<entity>.dto.ts   e.g. create-match.dto.ts, update-match.dto.ts
  <module>.service.spec.ts   unit tests next to the code
```

- File names: `kebab-case` with a role suffix (`.controller.ts`, `.service.ts`, `.dto.ts`, `.guard.ts`).
- Classes: `UpperCamelCase` with a role suffix (`MatchService`, `CreateMatchDto`, `IsMasterGuard`).
- Controllers contain no business logic and no database calls.
- Services never use a Mongoose model directly; repositories never contain business rules.
- One controller class per file, and every controller is registered in its module.
- Avoid circular module imports; if two modules need each other, move the shared logic.

### Validation and DTOs

- Every request body, param and query is a DTO class with class-validator decorators.
  The global `ValidationPipe` uses `whitelist` and `forbidNonWhitelisted`.
- Nested objects use `@ValidateNested()` + `@Type(() => NestedDto)`.
- Arrays use `{ each: true }` validators. Enums use `@IsEnum`. Ids use `@IsMongoId`.
- Clients never set server-owned fields (ids, owners, roles, timestamps, emails from the token).

### Authorization

- The global `FirebaseAuthGuard` authenticates every route; use `@Public()` only for genuinely
  public endpoints (health, invite preview).
- Role checks with `@Roles(...)`; resource checks with guards such as `IsMasterGuard` / a
  membership guard. When a route has both a parent id and a child id, verify the child belongs
  to the parent.
- Use `req.user.dbUser._id` for the caller's id; never trust ids from the body for "who am I".

### Types, logging, errors

- `noImplicitAny` is the goal: no `any` in new code without a comment explaining why.
- Use Nest's `Logger` (`private readonly logger = new Logger(MyService.name)`), never `console.log`.
- Don't swallow errors; let Nest exceptions bubble up or wrap with context.

### Database

- Concurrent updates use atomic operators (`$addToSet`, `$pull`, `$inc`) or transactions —
  no read-modify-save for shared state like `calledNumbers`.
- Deleting a parent cleans up its children (cards, events, invites, user pointers).

## 3. Website (React + Vite)

- **Structure:** `src/api/` (axios calls, one file per resource), `src/pages/` (route components),
  `src/components/` (reusable UI), `src/store/` (client-only state, zustand), `src/types/`.
- All server data through **React Query** (`useQuery` / `useMutation`) with the functions in `src/api/`.
  Components never call axios directly.
- API functions only call endpoints that exist in the backend; check the controller first.
- One UI component library (decided in HEM-102); don't add another.
- Files: components in `PascalCase.tsx`, everything else `camelCase.ts`.
- TypeScript `strict` stays on; no `any` without a comment.
- User-facing text goes through i18n once HEM-103 lands.

## 4. Comments and docs

- Comments explain *why*, not *what*. Public services and non-obvious functions get a JSDoc comment.
- No commented-out code (git has the history), no emoji markers.
- `TODO` only with an issue key: `// TODO(HEM-123): ...`.

## 5. Formatting and linting

- Prettier: single quotes, trailing commas (`backend/.prettierrc`). Run it on changed files.
- ESLint must pass on changed files; disable a rule inline only with a comment explaining why.

## 6. Tests

- Backend unit tests (`*.spec.ts`) for services, guards and pure functions such as card generation
  and bingo verification. Mock repositories, not Mongoose internals.
- E2E tests (`backend/test/*.e2e-spec.ts`) for new endpoints, including the 401/403 cases.
