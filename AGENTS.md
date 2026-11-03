# AGENTS.md — Hemelvaart Bingo API and website (Node)

These are the hard rules for changing this repository. They apply to everyone:
humans, Claude Code, and local models (Ollama via aider, opencode, etc.).
Read this whole file before you change anything.

## 1. Context

- **This repo** is an npm workspaces monorepo:
  - `backend/` — NestJS 11 API with MongoDB (Mongoose), Firebase Admin (auth + FCM) and socket.io.
  - `frontend/` — React 19 + Vite website: the central place where users see match stats,
    masters see details about their players and matches, and admins manage the platform.
- **Sibling repo:** `HemelvaartBingo` is the Flutter app (deployed as a web PWA). It uses this API.
- **API shape:** global prefix from `PREFIX` (production: `api`) + URI versioning, so routes are
  `/api/v1/...`. Auth is a Firebase ID token in `Authorization: Bearer <token>`, checked by a
  global guard; routes opt out with `@Public()`.
- **Work tracker:** Jira project **HEM** — https://avansprojects.atlassian.net/browse/HEM.
  Work is planned in weekly sprints by the owner.
  It will move to self-hosted GitLab issues later; the rules stay the same.

## 2. Hard rules

The project record (Jira, git history, PRs, docs) must read as human work that AI assisted
with, never as AI-built or AI-controlled. Rules 2–6 exist for that reason.

1. **No work without an issue.** Every change belongs to exactly one HEM issue.
   If there is none, stop and ask for one. Agents with tracker access may create it.
   - **Story** for anything a user, master or admin notices in the API or website:
     `As a <role> I want <goal> so that <reason>` plus Given/When/Then acceptance criteria.
   - **Task** for tooling, CI/CD, docs, infrastructure and refactors without behaviour change.
   - **Bug** for defects. Link it ("relates to") to the story it breaks.
   - **Epic** only groups issues; never work directly on an epic.
2. **No branch, no work.** The owner plans weekly sprints and creates the branch for an issue
   from Jira (Development panel → *Create branch*, based on `dev`), named `HEM-<n>-<Summary-slug>`.
   Agents only work on issues that already have a branch: `git fetch && git checkout HEM-<n>-...`.
   Never create branches yourself. If there is no branch, stop and ask the owner.
   - Agents with tracker access always read the issue (description and acceptance criteria) first.
   - Agents without tracker access take the issue key and summary from the branch name and ask
     the owner for the acceptance criteria if they aren't given.
3. **Humans own git and PRs.** Agents never commit, push, merge, or open, approve or comment on PRs.
   Leave your changes uncommitted. The owner verifies, tests, commits (`HEM-<n>: <imperative summary>`),
   pushes and opens the PR into `dev`. Never run history- or work-destroying git commands
   (`reset --hard`, `clean`, `checkout -- <file>` on changes you didn't make, force anything).
4. **One issue at a time.** The working tree only contains changes for the issue of the
   checked-out branch. Don't start another issue until the owner has committed your work
   or tells you to continue. The release branch only receives merges from `dev`.
5. **Agents only create issues in the tracker.** Creating a Story, Task or Bug is allowed.
   Everything else — comments, status transitions, sprint changes, field or description edits,
   links, work logs — happens only when the owner explicitly asks, and then the text is exactly
   what the owner said, word for word. Never post progress, status or summaries to the tracker.
6. **No AI watermarks anywhere.** No `Co-Authored-By` AI trailers, "Generated with …", model or
   tool names, signatures or robot emoji in issues, commit messages, PR text, code, comments or docs.
7. **Docs and ADRs are written by the owner.** Don't write or rewrite docs (`docs/`, READMEs, ADRs,
   this file) unless the issue explicitly asks for it. Treat them as the source of truth: if code,
   an issue or a request contradicts a doc, stop and ask instead of choosing one yourself.
8. **Stay in scope.** Only change what the issue needs. If you find another problem,
   mention it in your handover and ask for a new issue — don't fix it on the side.
9. **No secrets in git.** Never commit `.env`, `firebase-service-account.json`,
   `FIREBASE_SERVICE_ACCOUNT_B64` values, database URIs with credentials or tokens.
10. **English** for code, comments, commits and issues.
    User-facing website text must be translatable (NL + EN) once site i18n lands (HEM-103).
11. **API contracts are shared.** The Flutter app and the website both call this API.
    Any change to a route, request or response shape must keep existing clients working
    (or bump the API version), and the client change must be planned under a linked issue.
    Follow the REST conventions in `docs/conventions.md`.
12. **Every endpoint is authorized.** New endpoints must check *who* may access *which* data
    (role guards, master/member checks, ownership). Never return other users' private fields
    (email, roles, FCM tokens) unless the caller is an admin.
13. **Don't guess.** If the issue or acceptance criteria are unclear, ask before building.

## 3. Setup and commands

Run from the repo root unless noted:

```bash
npm ci                                  # installs both workspaces
npm run dev                             # backend (watch) + website (vite) together
npm run build                           # builds backend then frontend

npm run lint   -w backend               # eslint (fixes what it can)
npm run test   -w backend               # jest unit tests (*.spec.ts next to the code)
npm run test:e2e -w backend             # e2e tests (backend/test)
npm run build  -w backend

npm run lint   -w frontend
npm run build  -w frontend              # tsc -b && vite build

docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build   # full stack incl. Mongo port
```

Configuration comes from `.env` in the repo root (see `backend/src/config.ts` and `docker-compose.yml`
for the variable names). Never commit it.

## 4. Definition of Done

An issue is done only when all of these are true:

- [ ] Every acceptance criterion of the issue is met.
- [ ] `npm run lint` passes for each workspace you touched, with no new warnings.
- [ ] New or changed backend logic has unit tests (and an e2e test for new endpoints);
      `npm run test -w backend` passes.
- [ ] `npm run build` succeeds.
- [ ] Authorization of every new or changed endpoint is covered (rule 12).
- [ ] The handover is given to the owner (section 5).

Then stop. The owner verifies, tests, commits, opens the PR and moves the issue in Jira.

## 5. Handover

Report to the owner, not to the tracker. Details and the template:
[`docs/worklog/README.md`](docs/worklog/README.md).

- **In an interactive session** (Claude Code, aider, opencode): give the handover in the
  session, using the structure of `docs/worklog/TEMPLATE.md`.
- **In a headless run** (no session to reply to): write it to `docs/worklog/HEM-<n>.md`
  on the branch, uncommitted. The owner reads it and deletes it; it never reaches git or the tracker.
- The owner decides what goes into Jira and writes it there themselves.

## 6. Code conventions (summary)

Full rules: [`docs/conventions.md`](docs/conventions.md). The most important ones:

- **REST:** plural kebab-case resources, nested under their owner
  (`/matches/:matchId/events/:eventId`), camelCase JSON, correct status codes,
  errors as `{ statusCode, message, error }`.
- **Backend modules:** `controller` (HTTP only) → `service` (business rules) → `repository`
  (database only). DTOs live in `dto/` with class-validator decorators; schemas in `schemas/`.
- No `any` without a comment, no `console.log` (use Nest `Logger`), no commented-out code.
- **Website:** API calls only in `src/api/`, server state through React Query, one UI component library.
- Comments explain *why*.

## 7. Project map

```
backend/src/
  main.ts, app.module.ts, config.ts     bootstrap, global guards/pipes/filters, env config
  auth/                                 Firebase strategy, guards, decorators
  users/ matches/ cards/ events/        domain modules (controller, service, repository, schema)
  invites/ ads/ notifications/ admin/   …
  health/                               public health check
  shared/                               bingo config and card generation
backend/test/                           e2e tests
frontend/src/
  api/                                  axios client and API calls
  pages/ components/ store/ firebase/   website UI, state, auth
docs/                                   conventions, work logs, decision docs
```

## 8. Tool notes

- **Claude Code** loads this file through `CLAUDE.md`.
- **opencode / Codex-style tools** read `AGENTS.md` automatically.
- **aider:** start with `aider --read AGENTS.md --read docs/conventions.md`.
- Local models without tracker access get their issue context from the branch name (rule 2).
- Keep tool attribution off: no co-author trailers or "generated by" footers (rule 6).
