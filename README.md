# Shop2024 - Full Stack E-commerce Application

A modern e-commerce platform built with **Laravel 10** backend API and **React 18** frontend, featuring secure SPA authentication using Laravel Sanctum.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Frontend Setup](#frontend-setup)
- [Usage](#usage)
- [Company CRUD (Backend + Frontend)](#company-crud-backend--frontend)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Overview

Shop2024 is a full-stack e-commerce application that demonstrates modern web development practices with secure authentication, responsive design, and scalable architecture. The application uses Laravel Sanctum for secure API authentication and provides both stateful and stateless request handling.

### Key Highlights

- **Secure Authentication**: Laravel Sanctum with CSRF protection
- **Modern Frontend**: React 18 with Vite for fast development
- **Responsive Design**: Tailwind CSS with Flowbite components
- **API-First Architecture**: RESTful API with proper validation
- **State Management**: React Context for authentication state

## 🛠 Tech Stack

### Backend
- **Laravel 10** - PHP web framework
- **Laravel Sanctum** - API authentication
- **MySQL** - Database
- **Eloquent ORM** - Database abstraction
- **Form Requests** - Input validation

### Frontend
- **React 18** - JavaScript library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Flowbite** - UI component library

## ✨ Features

### Authentication System
- User registration with validation
- Secure login with password hashing
- JWT token-based authentication
- CSRF protection
- Automatic token refresh
- Secure logout functionality

### User Management
- User profile management
- Protected routes
- Guest/authenticated layouts
- Session persistence

### UI/UX Features
- Responsive design
- Dark mode support
- Form validation with error handling
- Loading states
- Toast notifications

## 📁 Project Structure

```
shop2024/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Middleware/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   └── Models/
│   ├── config/
│   ├── database/
│   └── routes/
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── assets/
│   └── public/
└── README.md
```

## 🚀 Installation

### Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 16+ and npm
- MySQL 8.0 or higher
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shop2024/backend
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database setup**
   ```bash
   # Update .env with your database credentials
   php artisan migrate
   php artisan db:seed
   ```

5. **Start the server**
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## ⚙️ Configuration

### Backend Environment Variables

```env
# Application
APP_NAME=Shop2024
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shop2024
DB_USERNAME=root
DB_PASSWORD=

# Sanctum Configuration
FRONTEND_URL=http://localhost:3000
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000

# Session
SESSION_DRIVER=cookie
SESSION_LIFETIME=120
```

### Frontend Configuration

Update `src/axios.js` with your backend URL:

```javascript
const axios = Axios.create({
    baseURL: "http://localhost:8000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "created_at": "2024-01-01T00:00:00.000000Z"
    }
}
```

#### Login User
```http
POST /api/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

#### Get Authenticated User
```http
GET /api/user
Authorization: Bearer {token}
```

#### Logout User
```http
POST /api/logout
Authorization: Bearer {token}
```

### Error Responses

```json
{
    "message": "Validation failed",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password field is required."]
    }
}
```

## 🏢 Company CRUD (Backend + Frontend)

This project includes a full CRUD implementation for managing companies, with a Laravel API and React pages/forms.

### Backend: Company API

- Controller: `backend/app/Http/Controllers/Api/CompanyController.php`
- Model: `backend/app/Models/Company.php`
- Migrations: `backend/database/migrations/2025_10_05_093450_create_companies_table.php`
- Routes: `backend/routes/api.php`

#### Endpoints

- List companies
  ```http
  GET /api/companies
  ```

- Get company detail
  ```http
  GET /api/companies/{id}
  ```

- Create company
  ```http
  POST /api/companies
  Content-Type: application/json

  {
      "name": "Acme Inc",
      "email": "info@acme.test",
      "website": "https://acme.test"
  }
  ```

- Update company
  ```http
  PUT /api/companies/{id}
  Content-Type: application/json

  {
      "name": "Acme Incorporated",
      "email": "contact@acme.test",
      "website": "https://acme.test"
  }
  ```

- Delete company
  ```http
  DELETE /api/companies/{id}
  ```

#### Typical Response Shape

```json
{
  "data": {
    "id": 1,
    "name": "Acme Inc",
    "email": "info@acme.test",
    "website": "https://acme.test",
    "created_at": "2025-10-05T09:34:50.000000Z"
  }
}
```

#### Validation

- Required fields: `name`
- Optional: `email` (must be valid email), `website` (valid URL)

> Note: Exact validation rules live in request classes under `backend/app/Http/Requests` if present, or in the controller.

### Frontend: Company Pages & Templates

- Pages/Components:
  - `frontend/src/components/company/create.component.jsx` — Create form
  - `frontend/src/components/company/edit.component.jsx` — Edit form
  - `frontend/src/components/company/detail.component.jsx` — Detail view
  - (List page lives in your routing/pages setup, e.g. `frontend/src/pages`)
- Router: `frontend/src/router.jsx`
- Layouts: `frontend/src/components/ProtectedLayout.jsx`, `frontend/src/components/GuestLayout.jsx`

#### Common UX Patterns

- Forms use controlled inputs, client-side validation, and Axios to call the API (`frontend/src/axios.js`).
- Success/failure feedback is surfaced via alerts/toasts and inline error messages.
- Protected routes ensure only authenticated users can create/edit.

#### Example Routes (React Router)

```jsx
// in frontend/src/router.jsx
{
  path: "/companies",
  children: [
    { path: "new", element: <CreateCompany /> },
    { path: ":id", element: <CompanyDetail /> },
    { path: ":id/edit", element: <EditCompany /> },
  ],
}
```

#### Example Axios Calls

```js
// Create
axios.post("/companies", payload)

// Update
axios.put(`/companies/${id}`, payload)

// Delete
axios.delete(`/companies/${id}`)
```

## 🎨 Frontend Setup

### Component Structure

```
src/
├── components/
│   ├── GuestLayout.jsx      # Layout for unauthenticated users
│   └── ProtectedLayout.jsx  # Layout for authenticated users
├── contexts/
│   └── AuthContext.jsx      # Authentication state management
├── pages/
│   ├── Login.jsx           # Login page
│   ├── Register.jsx        # Registration page
│   ├── Profile.jsx         # User profile page
│   └── About.jsx           # About page
└── axios.js               # HTTP client configuration
```

### Key Features

- **Context-based State Management**: Centralized authentication state
- **Protected Routes**: Automatic redirection based on auth status
- **Form Validation**: Real-time validation with error display
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Built-in dark mode support

## 🔐 Security Features

### Laravel Sanctum Security

- **CSRF Protection**: Automatic CSRF token generation and validation
- **Cookie-based Authentication**: Secure HTTP-only cookies
- **Token Management**: Automatic token creation and deletion
- **Session Security**: Configurable session lifetime and domain restrictions

### Frontend Security

- **Secure HTTP Client**: Axios with credentials support
- **Input Validation**: Client and server-side validation
- **Protected Routes**: Route guards for authenticated users
- **Secure Storage**: Local storage for user data

## 🚀 Usage

### Development Workflow

1. **Start both servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && php artisan serve
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

3. **Test authentication**
   - Register a new account
   - Login with credentials
   - Access protected routes
   - Test logout functionality

### Production Deployment

1. **Backend deployment**
   ```bash
   composer install --optimize-autoloader --no-dev
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

2. **Frontend build**
   ```bash
   npm run build
   ```

## 🧪 Testing

### Backend Testing
```bash
cd backend
php artisan test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow PSR-12 for PHP code
- Use ESLint and Prettier for JavaScript/React code
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:

- **Email**: nguyenvandat170296@gmail.com
- **Documentation**: [Project Documentation](https://docs.google.com/document/d/19myzJ_ZzX-ajytrTG5V67BFwRJ5dZLQgkxXqyCe1BrM/edit?usp=sharing)
- **Issues**: [GitHub Issues](https://github.com/your-repo/shop2024/issues)

## 🙏 Acknowledgments

- Laravel team for the amazing framework
- React team for the powerful frontend library
- Tailwind CSS for the utility-first CSS framework
- Flowbite for the beautiful UI components

---

**Built with ❤️ by Henry** 