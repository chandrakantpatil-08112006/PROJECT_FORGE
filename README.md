# ProjectForge 🚀

**Discover projects. Showcase your skills. Build teams. Create together.**

ProjectForge is a full-stack developer collaboration platform that connects developers with projects that match their interests and technical skills. Users can publish project ideas, define the roles they need, discover opportunities, apply to open positions, and build teams through a structured application workflow.

## ✨ Features

### 🔐 Authentication & Profiles

- User registration and login.
- JWT-based authentication with access-token refresh.
- Secure refresh-token rotation and logout.
- Protected routes and role-based access control.
- Editable developer profiles with skills and profile information.

### 📂 Project Management

- Create, edit, publish, unpublish, and archive projects.
- Define required skills, project categories, difficulty, team size, and open roles.
- Manage project lifecycle and recruitment status.
- Restore archived projects.
- View project details, required skills, roles, owner information, and team members.

### 🔎 Explore Projects

- Discover projects through a public project listing.
- Search projects by title, summary, and relevant skills.
- Filter by skills, category, difficulty, and status.
- Sort results and navigate through paginated listings.
- Find opportunities aligned with your technical skills.

### 🤝 Applications & Team Formation

- Apply for specific project roles with an optional message.
- Track your submitted applications.
- Review incoming applications as a project owner.
- Accept or decline applications.
- Automatically add accepted applicants to the project team.
- Enforce role capacity and team-size limits.
- Remove team members, leave projects, and transfer project ownership with server-side permission checks.

### 🛠️ Skill Administration

- Browse a predefined catalogue of approximately 150 skills.
- Search and filter available skills.
- Admin-only skill creation, editing, and deletion.
- Seed predefined skills and bootstrap an administrator account.

### 🎨 User Experience

- Responsive React interface for desktop, tablet, and mobile.
- Reusable UI components and consistent page layouts.
- Animated reveal effects, polished interactions, loading states, and skeleton components where implemented.
- Form validation, error handling, and user feedback.

## 🧰 Tech Stack

| Frontend                  | Backend                      |
| ------------------------- | ---------------------------- |
| React 19                  | Node.js 20.6+                |
| Vite                      | Express 5                    |
| Tailwind CSS 4            | MongoDB & Mongoose           |
| React Router              | JWT & bcrypt                 |
| Redux Toolkit & RTK Query | Zod validation               |
| Axios                     | Helmet, CORS & rate limiting |
| React Hook Form           | Vitest & Supertest           |

## 🏗️ Architecture

ProjectForge uses a modular client-server architecture.

```text
ProjectForge/
├── client/
│   └── src/
│       ├── api/            # Axios client and API integration
│       ├── app/            # Redux store
│       ├── features/       # Auth, projects, skills and profiles
│       ├── components/     # Shared UI and layout components
│       ├── pages/          # Public, application and admin pages
│       └── routes/         # Protected, guest and admin routes
│
├── server/
│   └── src/
│       ├── config/         # Environment, database and CORS
│       ├── constants/      # Enums and application rules
│       ├── controllers/    # HTTP request handling
│       ├── middleware/     # Auth, validation and error handling
│       ├── models/         # Mongoose models
│       ├── policies/       # Permission rules
│       ├── routes/         # API routes
│       ├── seeds/          # Skill catalogue and admin setup
│       ├── services/       # Business logic
│       ├── utils/          # Shared utilities
│       └── validators/     # Zod schemas
│
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

- Node.js 20.6 or newer.
- npm.
- MongoDB Atlas or a local MongoDB instance.

### 1. Clone the repository

```bash
git clone https://github.com/chandrakantpatil-08112006/PROJECT_FORGE.git
cd PROJECT_FORGE
```

### 2. Configure the backend

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and configure the required environment variables, including your MongoDB connection string and JWT access-token secret.

For a local MongoDB instance, the connection string can be:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/projectforge
```

Use the variable names and required values documented in `server/.env.example`.

Seed the predefined skills:

```bash
npm run seed:skills
```

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Configure the frontend

Open a second terminal from the repository root:

```bash
cd client
npm install
```

Copy `client/.env.example` to `client/.env` and configure it if necessary. The provided defaults are intended for local development.

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

### 4. Create an administrator

Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`, then run:

```bash
cd server
npm run seed:admin
```

This creates an administrator account or promotes an existing account with the configured email. Administrators can access the skill-management interface.

## 🧪 Testing

Run the backend test suite:

```bash
cd server
npm test
```

The tests use an in-memory MongoDB server, which may download the MongoDB binary on the first run.

Alternatively, use a dedicated test database:

```bash
MONGODB_URI_TEST=mongodb://127.0.0.1:27017/pf_test npm test
```

**Warning:** The configured test database is wiped by the test suite. Never point it at a database containing important data.

Build the frontend for production:

```bash
cd client
npm run build
```

## 🔒 Security & Design

- Access tokens are short-lived and held in memory on the client.
- Refresh tokens are stored in HTTP-only cookies and hashed in the database.
- Refresh-token rotation includes reuse detection.
- Server-side middleware validates requests and enforces access permissions.
- Zod schemas validate request data.
- Rate limiting and security headers help protect API endpoints.
- Project deletion is implemented as soft deletion through archiving.
- Project ownership, membership, application decisions, and role capacity are enforced by the backend.

## 📌 Project Status

| Phase   | Status     | Scope                                                               |
| ------- | ---------- | ------------------------------------------------------------------- |
| Phase 1 | ✅ Complete | Authentication, profiles, protected routes and dashboard            |
| Phase 2 | ✅ Complete | Skills, project lifecycle, Explore and project details              |
| Phase 3 | ✅ Complete | Role-specific applications, application reviews and team management |
| Phase 4 | 📋 Planned | Project tasks and collaboration workspace                           |
| Phase 5 | 📋 Planned | Real-time chat and notifications                                    |
| Phase 6 | 📋 Planned | GitHub OAuth and repository integration                             |
| Phase 7 | 📋 Planned | AI-powered project and developer assistance                         |

Features in the planned phases are not currently part of the implemented feature set.

## 🗺️ Roadmap

- [x] Project task management and progress tracking.
- [ ] Real-time notifications.
- [ ] Team chat and collaboration.
- [ ] Verified GitHub account linking and repository integration.
- [ ] AI-powered project recommendations and developer assistance.
- [ ] Further UI/UX improvements and deployment enhancements.

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test them.
4. Submit a pull request describing the improvements.

## 👨‍💻 Author

**Chandrakant Patil**

GitHub: [@chandrakantpatil-08112006](https://github.com/chandrakantpatil-08112006)

---

*ProjectForge — Turning project ideas into collaborative software projects.*
