# GitHub CRM

A simple project management system (CRM) for public GitHub repositories built with React, Node.js, and PostgreSQL.

## Features

- **User Authentication**: Register and login with email and password
- **Project Management**: Add, view, update, and delete GitHub repositories
- **GitHub Integration**: Automatically fetch repository data from GitHub API
- **Real-time Data**: View stars, forks, open issues, and creation date
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend

- **Node.js** with **TypeScript**
- **Express.js** web framework
- **PostgreSQL** database
- **JWT** authentication
- **GitHub API** integration

### Frontend

- **React** with **TypeScript**
- **Axios** for API calls
- **CSS3** for styling
- **Responsive design**

### Infrastructure

- **Docker** and **Docker Compose**
- **Nginx** for frontend serving
- **PostgreSQL** container

## Project Structure

```
github-crm/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Authentication middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # GitHub API service
│   │   ├── validation/     # Input validation schemas
│   │   ├── app.ts          # Express app configuration
│   │   └── index.ts        # Server entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API service
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── App.css         # Styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml      # Docker Compose configuration
├── init-db.sql            # Database initialization
└── README.md
```

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd github-crm
   ```

2. **Start the application with Docker Compose**

   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database: localhost:5432

### Development Setup

If you prefer to run the application in development mode:

1. **Backend Setup**

   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

2. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Database Setup**
   - Install PostgreSQL locally
   - Create a database named `github_crm`
   - Update the backend `.env` file with your database credentials

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)

### Projects

- `GET /api/projects` - Get all projects for authenticated user
- `POST /api/projects` - Add a new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project data
- `DELETE /api/projects/:id` - Delete project

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Add Projects**: Click "Add Project" and enter a GitHub repository path (e.g., `facebook/react`)
3. **View Projects**: See all your projects with their GitHub data
4. **Update Projects**: Click "Update" to refresh data from GitHub
5. **Delete Projects**: Click "Delete" to remove projects from your list

## Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build

# View logs
docker-compose logs -f

# Stop and remove volumes
docker-compose down -v
```

## Database Schema

### Users Table

- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR UNIQUE)
- `password_hash` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Projects Table

- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users)
- `owner` (VARCHAR)
- `name` (VARCHAR)
- `url` (VARCHAR)
- `stars` (INTEGER)
- `forks` (INTEGER)
- `open_issues` (INTEGER)
- `created_at_unix` (BIGINT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers
- SQL injection prevention

## Performance Features

- Database indexing
- Connection pooling
- Request caching
- Gzip compression
- Static asset optimization

## License

MIT License
