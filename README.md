# URL Shortener Client

A responsive, modern React frontend for the Authenticated URL Shortener application. Built with React, Vite, TypeScript, and React Router. Features a complete authentication flow with email OTP verification, a protected URL management dashboard, copy-to-clipboard functionality, and real-time click analytics.

---

## Features

- **User Registration** with email OTP verification flow
- **OTP Verification Page** with 6-digit input, countdown timer, and resend functionality
- **Secure Login** with error handling and post-login redirect
- **Session Restoration** — automatically restores authentication state on page refresh via `/api/auth/me`
- **Protected Routes** — unauthenticated users are redirected to `/login`
- **Public-Only Routes** — authenticated users are redirected from `/login` to `/dashboard`
- **URL Shortener Dashboard** — shorten URLs, view all links, copy short URLs, track click counts, and delete links
- **Copy-to-Clipboard** with 2-second visual "Copied!" feedback
- **Click Analytics** badge showing total redirect clicks per URL
- **Responsive Design** using pure CSS custom properties (no heavy CSS frameworks)
- **Centralized API Service** with typed `fetch` wrapper and unified error handling
- **Loading and Empty States** for a polished user experience

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| Framework | React 18 |
| Build Tool | Vite |
| Language | TypeScript (strict mode) |
| Routing | React Router v7 |
| State Management | React Context API |
| HTTP Client | Native Fetch API |
| Icons | Lucide React |
| Styling | Custom CSS (CSS Variables) |

---

## Application Architecture

```
src/
├── components/        # Reusable UI components (Navbar)
├── context/           # AuthContext — global user state & session restoration
├── pages/             # RegisterPage, LoginPage, VerifyOtpPage, DashboardPage
├── routes/            # ProtectedRoute & PublicOnlyRoute guards
├── services/          # Centralized API client (api.ts)
├── types/             # Shared TypeScript interfaces (User, Url, ApiResponse)
├── App.tsx            # BrowserRouter & route configuration
└── main.tsx           # React DOM mount point
```

### Authentication State Flow

```
App Mount
    │
    ▼
AuthContext → GET /api/auth/me
    │
    ├── Cookie valid?  → setUser(user) → isAuthenticated: true
    │
    └── No cookie / 401 → setUser(null) → isAuthenticated: false
            │
            ▼
    ProtectedRoute → Redirect to /login
```

### Page Flow

```
/register
    │ Registration success
    ▼
/verify-otp?email=...
    │ OTP verified
    ▼
/dashboard (Protected)
    │ Logout
    ▼
/login
```

---

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- The [url-shortener-api](https://github.com/mhdadil-kk/url-shortener-api) backend running on port `5000`

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/mhdadil-kk/url-shortener-client.git
cd url-shortener-client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set your backend URL:

```env
VITE_API_BASE_URL=http://localhost:5000
```

> **Note**: For production deployment, set `VITE_API_BASE_URL` to your deployed backend API URL.

### 4. Start development server

```bash
npm run dev
```

The client starts on `http://localhost:5173`.

> **Important**: Make sure `url-shortener-api` is running on port `5000` before starting the client.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run preview` | Preview the production build locally |

---

## Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | Backend API base URL |

> **Note**: Vite exposes only variables prefixed with `VITE_` to the client-side bundle. Never put secrets in frontend environment variables.

---

## Pages & Routes

| Route | Guard | Description |
| :--- | :--- | :--- |
| `/` | Protected | Redirects to `/dashboard` (or `/login` if unauthenticated) |
| `/register` | Public Only | User registration form |
| `/verify-otp` | Public Only | Email OTP verification |
| `/login` | Public Only | User login form |
| `/dashboard` | Protected | URL management dashboard |
| `*` | None | 404 Not Found page |

---

## API Integration

All backend communication is handled through `src/services/api.ts`.

### Key Behaviors

- **`credentials: 'include'`**: All requests include HTTP-Only cookies automatically, enabling seamless cookie-based JWT authentication.
- **Typed Responses**: Every API method is generically typed, providing autocompletion and build-time safety.
- **Unified Error Handling**: `ApiClientError` wraps all HTTP and network failures with `statusCode`, `message`, and optional `errors` array.

### API Methods

```typescript
// Authentication
api.auth.register({ email, password })
api.auth.verifyOtp({ email, otp })
api.auth.resendOtp(email)
api.auth.login({ email, password })
api.auth.getMe()
api.auth.logout()

// URL Management
api.urls.getAll()
api.urls.create(originalUrl)
api.urls.delete(id)
```

---

## Authentication Flow

### Registration
1. User submits email and password on `/register`.
2. Backend creates an unverified account and sends a 6-digit OTP to their email.
3. Frontend navigates to `/verify-otp?email=...`.
4. User enters the 6-digit code (valid for 10 minutes, max 5 attempts).
5. Backend verifies the OTP, activates the account, and returns a JWT cookie.
6. Frontend navigates to `/dashboard`.

### Session Restoration
On every page load, `AuthContext` calls `GET /api/auth/me`:
- If the HTTP-Only cookie is valid, the user's profile is restored and they stay logged in.
- If the cookie is expired or missing, the user is redirected to `/login`.

### Logout
- `POST /api/auth/logout` clears the HTTP-Only cookie on the server.
- `AuthContext` sets `user` to `null`.
- Frontend redirects to `/login`.

---

## Security Considerations

- **HTTP-Only Cookies**: The JWT token is stored in an HTTP-Only cookie set by the backend. JavaScript cannot access this cookie, preventing XSS-based token theft.
- **`credentials: 'include'`**: Required for cross-origin cookie transmission between the React dev server (port 5173) and the Express API (port 5000).
- **No Sensitive Data in localStorage**: Tokens, user IDs, and passwords are never stored in `localStorage` or `sessionStorage`.
- **Frontend Route Guards**: `ProtectedRoute` and `PublicOnlyRoute` provide UX-level access control. All real security is enforced by the backend API.

---

## Deployment

### Build for Production

```bash
npm run build
```

The `dist/` folder contains the optimized static files.

### Recommended Hosting Platforms

- **Vercel**: Connect your GitHub repository and configure `VITE_API_BASE_URL` in Vercel's environment variables settings.
- **Netlify**: Upload `dist/` or connect via GitHub. Add a `_redirects` file in `public/` for SPA routing:
  ```
  /*    /index.html   200
  ```

### SPA Routing Note
Since this is a Single Page Application, your hosting platform must redirect all routes to `index.html`. Vercel handles this automatically. Netlify requires the `_redirects` file above.

---

## Known Limitations

- No refresh token implementation; sessions are valid for 2 hours (JWT expiry).
- No profile management page (update email or password).
- OTP delivery in development is printed to the backend terminal console.
- Copy-to-clipboard requires a modern browser with `navigator.clipboard` support (requires HTTPS in production).

---

## Related Repositories

- **Backend API**: [url-shortener-api](https://github.com/mhdadil-kk/url-shortener-api) — Express, TypeScript, MongoDB

---

## AI-Assisted Development Disclosure

This project was developed with the assistance of **Google Antigravity (AI assistant)** as a technical mentor and code reviewer throughout the development process.

AI assistance was used for:
- **Architecture Design**: Designing the React component hierarchy, AuthContext structure, and API service layer.
- **Concept Explanation**: Understanding React Context, custom hooks, `credentials: 'include'` CORS behavior, cookie-based authentication, and Vite's environment variable system.
- **Implementation Guidance**: Step-by-step guidance for building each page and component.
- **Code Review**: Catching TypeScript `verbatimModuleSyntax` errors, Express v5 route changes, and Zod v4 API differences.
- **Debugging**: Resolving PowerShell `curl` syntax issues, build errors, and authentication cookie behavior.
- **Security Design**: Advising on HTTP-Only cookie storage vs localStorage trade-offs and CSRF mitigation strategies.

**All code was manually written, understood, tested, and committed by the developer.** No code was blindly copied without understanding its purpose and behavior.

This transparent AI-assistance disclosure is provided as required by the assignment guidelines. According to the assignment instructions, transparent AI use earns extra evaluation points.
