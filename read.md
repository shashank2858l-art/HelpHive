# HelpHive Full-Stack Project Documentation

This document provides a comprehensive overview of the HelpHive unified monorepo, detailing the frontend (client) and backend (server) architectures, technologies used, and project structure.

## Overview

HelpHive is a production-ready full-stack web application designed with a single client package and a unified backend API. The project facilitates disaster relief and volunteer coordination by providing dashboards for different user roles (Admin, Volunteer, etc.).

## Project Structure

The repository is structured as a monorepo consisting of the following main directories:

- `/client` - The frontend React application built with Vite.
- `/server` - The backend Node.js and Express API.
- `/legacy` - Contains legacy code or older versions of the project.

---

## 💻 Frontend (Client)

The frontend is a robust, modern React application utilizing the latest tools for performance, animations, and mapping capabilities.

### Key Technologies

- **Core**: React 19, React DOM, React Router v6
- **Build Tool**: Vite
- **Styling**: TailwindCSS, class-variance-authority, clsx, tailwind-merge, PostCSS
- **Animations & 3D**: Framer Motion, GSAP, Three.js, React Three Fiber, React Three Drei
- **Maps**: Leaflet, React Leaflet, Mapbox GL
- **State/Data Management**: Axios (HTTP Client), Socket.io-Client (Real-time communications)
- **Utilities**: html2pdf.js, Recharts (Data Visualization), i18next & react-i18next (Internationalization), Lucide React (Icons)

### Client Directory Structure (`/client/src/`)

- `components/`: Reusable UI components.
- `context/`: React context providers for global state management.
- `data/`: Static data or configuration files.
- `hooks/`: Custom React hooks.
- `pages/`: Page-level components corresponding to different routes (Landing, Admin, Volunteer dashboards).
- `services/`: API integration and utility services.

### Routing Contract

The application follows a defined routing flow:
- `/` - Landing page
- `/admin` - Admin dashboard
- `/volunteer` - Volunteer dashboard

**Flow:** `landing -> login/register -> role-selection -> dashboard`

---

## ⚙️ Backend (Server)

The backend provides a RESTful API built on Node.js and Express, connected to a Supabase PostgreSQL database. It handles authentication, data management, and integrates AI features.

### Key Technologies

- **Core**: Node.js, Express
- **Database**: Supabase (PostgreSQL) - via `@supabase/supabase-js`
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **AI Integration**: Groq SDK (`groq-sdk`)
- **Utilities**: cors, dotenv, express-async-errors

### Server Directory Structure (`/server/`)

- `controllers/`: Handles inbound HTTP requests and business logic.
  - `aiController.js` - Groq AI integration.
  - `analyticsController.js` - Dashboard analytics and metrics.
  - `authController.js` - User signup, login, and JWT generation.
  - `dashboardController.js` - Dashboard specific data retrieval.
  - `eventController.js` - Event management.
  - `resourceController.js` - Relief resource tracking.
  - `volunteerController.js` - Volunteer profiles and management.
  - `volunteerExperienceController.js` - Tracking volunteer history and experience.
- `models/`: Database schema definitions and interaction layers.
- `routes/`: Express route definitions mapping URLs to controllers.
- `middleware/`: Authentication and error handling middleware.
- `services/`: Reusable business logic and external API integrations.
- `supabase-schema.sql`: Raw SQL file for initializing the Supabase database schema.

### Database Schema (Supabase)

The backend relies on the following key tables:
- `users`: Core user accounts for all roles.
- `volunteers`: Extended profiles for volunteer users.
- `events`: Disaster relief events or initiatives.
- `resources`: Inventory or shared resources.
- `volunteer_activity` & `volunteer_experience`: Tracking volunteer participation.
- `help_requests`: Incoming requests for assistance.
- `notifications`: System notifications.
- `disasters`: Information regarding specific disaster instances.
- `tasks`: Actionable tasks assigned to volunteers or coordinators.

---

## Environment Variables Configuration

To run the project locally, environment variables must be configured for both the client and server.

### Backend (`server/.env`)

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
JWT_SECRET=<your-jwt-secret>
GROQ_API_KEY=<your-groq-api-key>
PORT=5000
CLIENT_URL=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api # Or your deployed backend URL
VITE_ROUTER_BASENAME=/admin # Depending on the deployment context
```

---

## scripts (`package.json`)

The root `package.json` provides monorepo scripts to easily run different parts of the stack:

- `npm run dev:client` - Starts the Vite development server for the frontend.
- `npm run dev:backend` - Starts the backend server using Nodemon.
- `npm run build:client` - Builds the frontend for production.
- `npm run start:backend` - Starts the backend server for production.

## Deployment Strategy

- **Frontend**: Designed to be deployed on platforms like Vercel or Netlify.
- **Backend**: Designed to be deployed on platforms like Render or Heroku.
- **Database**: Supabase cloud hosting.
