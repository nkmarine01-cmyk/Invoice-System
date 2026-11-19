# Implementation Plan: Authentication Login Feature

## Overview

This implementation plan converts the authentication login design into a series of incremental coding tasks. The feature implements a secure, JWT-based authentication system with a modern, ocean-themed login interface. Tasks are organized to build the backend authentication infrastructure first, then the frontend components, and finally integrate everything with route protection and session management.

## Tasks

- [~] 1. Install required backend dependencies
  - Install `jsonwebtoken` for JWT token generation and verification
  - Install `bcryptjs` for password hashing
  - Update server/package.json with new dependencies
  - Run npm install in server directory
  - _Requirements: 2.3, 8.6_

- [x] 2. Create User model and database schema
  - [x] 2.1 Create User model file at server/models/User.js
    - Define Mongoose schema with username (unique), passwordHash, and createdAt fields
    - Add validation rules (username: 3-50 chars, required, unique)
    - Export User model
    - _Requirements: 8.1_

  - [x] 2.2 Create seed script for initial user
    - Create server/seedUser.js to insert one admin user
    - Hash password with bcrypt before storing
    - Add script to package.json ("seed:user": "node seedUser.js")
    - _Requirements: 8.1_

- [x] 3. Implement backend authentication services
  - [x] 3.1 Create JWT service utilities at server/utils/jwtService.js
    - Implement generateToken(username) function using jsonwebtoken
    - Implement verifyToken(token) function with error handling
    - Use JWT_SECRET from environment variables
    - Set token expiration to 24 hours
    - _Requirements: 2.5, 8.6, 8.7_

  - [ ]* 3.2 Write property test for JWT round-trip integrity
    - **Property 2: JWT Token Round-Trip Integrity**
    - **Validates: Requirements 2.5, 8.6, 8.7**
    - Test that encoding username and decoding token returns original username
    - Use fast-check to generate random usernames
    - Minimum 100 iterations
    - _Requirements: 2.5, 8.6, 8.7_

  - [x] 3.3 Create password service utilities at server/utils/passwordService.js
    - Implement hashPassword(password) function using bcryptjs
    - Implement comparePassword(password, hash) function
    - Use salt rounds = 10
    - _Requirements: 2.3, 2.4_

  - [ ]* 3.4 Write property test for password hash verification consistency
    - **Property 1: Password Hash Verification Consistency**
    - **Validates: Requirements 2.3, 2.4**
    - Test that hashing password and comparing returns true
    - Use fast-check to generate random passwords (1-72 chars)
    - Minimum 100 iterations
    - _Requirements: 2.3, 2.4_

- [ ] 4. Create authentication controller and routes
  - [ ] 4.1 Create auth controller at server/controllers/authController.js
    - Implement login endpoint logic
    - Validate username and password inputs (reject empty values)
    - Query User model for username
    - Compare password hash using passwordService
    - Generate JWT token on success
    - Return token and username on success (200)
    - Return error message on failure (401 for invalid credentials, 400 for validation)
    - _Requirements: 2.1, 2.2, 2.6, 2.7, 2.8, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 4.2 Write unit tests for auth controller
    - Test successful login returns token
    - Test invalid username returns 401
    - Test invalid password returns 401
    - Test empty username returns 400
    - Test empty password returns 400
    - Mock User model and services
    - _Requirements: 2.1, 2.2, 2.6, 2.7, 2.8_

  - [ ]* 4.3 Write property test for empty input validation
    - **Property 5: Empty Input Validation**
    - **Validates: Requirements 2.6, 2.7, 2.8**
    - Test that empty, null, undefined, or whitespace-only inputs are rejected
    - Use fast-check to generate various invalid inputs
    - Minimum 100 iterations
    - _Requirements: 2.6, 2.7, 2.8_

  - [~] 4.4 Create auth routes at server/routes/auth.js
    - Define POST /api/auth/login route
    - Connect route to authController.login
    - Export router
    - _Requirements: 8.2_

  - [~] 4.5 Register auth routes in server.js
    - Import auth router
    - Mount at /api/auth path
    - Ensure route is registered before other routes
    - _Requirements: 8.2_

- [ ] 5. Implement authentication middleware
  - [~] 5.1 Create auth middleware at server/middleware/authMiddleware.js
    - Extract token from Authorization header (Bearer scheme)
    - Verify token using jwtService
    - Attach decoded user to req.user
    - Return 401 if token missing, invalid, or expired
    - Handle TokenExpiredError and JsonWebTokenError separately
    - _Requirements: 8.8, 3.7_

  - [ ]* 5.2 Write property test for token expiration enforcement
    - **Property 3: Token Expiration Enforcement**
    - **Validates: Requirements 3.6, 3.7**
    - Generate tokens with various expiration times
    - Test verification at different time offsets
    - Assert expired tokens are rejected
    - Minimum 100 iterations
    - _Requirements: 3.6, 3.7_

  - [ ]* 5.3 Write property test for invalid token rejection
    - **Property 4: Invalid Token Rejection**
    - **Validates: Requirements 8.8**
    - Generate malformed JWT strings, wrong signatures, tampered payloads
    - Assert all invalid tokens are rejected
    - Minimum 100 iterations
    - _Requirements: 8.8_

  - [ ]* 5.4 Write unit tests for auth middleware
    - Test valid token allows request to proceed
    - Test missing token returns 401
    - Test invalid token returns 401
    - Test expired token returns 401
    - Mock jwt.verify and request/response objects
    - _Requirements: 8.8, 3.7_

  - [~] 5.5 Apply auth middleware to protected routes
    - Add authMiddleware to existing invoice routes (GET, POST, PUT, DELETE)
    - Add authMiddleware to existing item routes (GET, POST, PUT, DELETE)
    - Update server/routes/api.js to use middleware
    - _Requirements: 4.3, 8.8_

- [~] 6. Checkpoint - Ensure backend tests pass
  - Run all backend unit tests and property tests
  - Verify auth endpoints respond correctly
  - Test middleware protects existing routes
  - Ensure all tests pass, ask the user if questions arise

- [~] 7. Install required frontend dependencies
  - Install `react-router-dom` for routing and navigation
  - Update client/package.json with new dependency
  - Run npm install in client directory
  - _Requirements: 4.1, 4.2_

- [ ] 8. Create authentication context and utilities
  - [~] 8.1 Create AuthContext at client/src/context/AuthContext.js
    - Define AuthContext with createContext
    - Create AuthProvider component with state for isAuthenticated, token, user
    - Initialize state by checking localStorage for existing token
    - Implement login(token, username) to store token and update state
    - Implement logout() to clear token and reset state
    - Implement checkAuth() to validate token existence
    - Export AuthProvider and useAuth hook
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 8.2 Write property test for session storage idempotence
    - **Property 6: Session Storage Idempotence**
    - **Validates: Requirements 3.1, 3.2**
    - Test storing and retrieving token returns identical string
    - Use fast-check to generate random token strings
    - Mock localStorage for testing
    - Minimum 100 iterations
    - _Requirements: 3.1, 3.2_

  - [ ]* 8.3 Write property test for authentication state consistency
    - **Property 7: Authentication State Consistency**
    - **Validates: Requirements 3.3, 4.1**
    - Test that isAuthenticated matches token validity
    - Generate various token states (valid, invalid, missing)
    - Assert state consistency
    - Minimum 100 iterations
    - _Requirements: 3.3, 4.1_

  - [ ]* 8.4 Write unit tests for AuthContext
    - Test initial state loads from localStorage
    - Test login() stores token and updates state
    - Test logout() clears token and resets state
    - Test checkAuth() returns correct boolean
    - Mock localStorage
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 9. Create axios interceptor for token management
  - [~] 9.1 Create axios config at client/src/utils/axiosConfig.js
    - Set up request interceptor to attach Authorization header with token from localStorage
    - Set up response interceptor to handle 401 errors
    - On 401, clear localStorage and redirect to /login
    - Export configured axios instance
    - _Requirements: 3.4, 3.7_

  - [~] 9.2 Replace all axios imports with configured instance
    - Update ItemForm.js to use configured axios
    - Update ItemList.js to use configured axios
    - Update InvoiceForm.js to use configured axios
    - Update InvoiceDashboard.js to use configured axios
    - _Requirements: 3.4_

- [ ] 10. Create LoginPage component with marine theme
  - [~] 10.1 Create LoginPage component at client/src/components/LoginPage.js
    - Define component state for username, password, error, isLoading
    - Implement handleSubmit to validate inputs and call login API
    - Implement handleInputChange to update state and clear errors
    - Call AuthContext login() on successful authentication
    - Navigate to main app on success using useNavigate
    - Display error messages for validation and authentication failures
    - _Requirements: 1.5, 2.1, 2.2, 2.6, 2.7, 2.8, 6.1, 6.2, 6.3, 6.6_

  - [~] 10.2 Create LoginPage CSS at client/src/components/LoginPage.css
    - Implement marine/ocean theme with blue gradients (#4682b4)
    - Create animated wave background using CSS animations
    - Style login card with glassmorphism effect (backdrop-filter: blur)
    - Style input fields with focus animations (border transition 300ms)
    - Style submit button with hover effect (translateY(-2px) transform)
    - Add loading spinner animation
    - Add error message shake animation (keyframes animation)
    - Implement responsive design for mobile, tablet, desktop
    - _Requirements: 1.2, 1.3, 1.4, 1.6, 1.7, 1.8, 5.1, 5.2, 5.3, 5.5, 5.7, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 10.3 Write unit tests for LoginPage component
    - Test component renders with all elements (logo, inputs, button)
    - Test form validation prevents submission with empty fields
    - Test error messages display correctly
    - Test loading state shows spinner
    - Test successful login calls AuthContext and navigates
    - Mock axios and AuthContext
    - _Requirements: 1.1, 1.5, 2.6, 2.7, 2.8, 6.7_

- [ ] 11. Create ProtectedRoute wrapper component
  - [~] 11.1 Create ProtectedRoute at client/src/components/ProtectedRoute.js
    - Use useAuth hook to check isAuthenticated
    - If not authenticated, return Navigate to="/login"
    - If authenticated, render children components
    - _Requirements: 4.1, 4.4, 4.5_

  - [ ]* 11.2 Write unit tests for ProtectedRoute
    - Test unauthenticated users are redirected to /login
    - Test authenticated users see protected content
    - Mock AuthContext with different auth states
    - _Requirements: 4.1, 4.5_

- [ ] 12. Create LogoutButton component
  - [~] 12.1 Create LogoutButton at client/src/components/LogoutButton.js
    - Use useAuth hook to access logout function
    - Render button with marine theme styling
    - On click, call logout() and navigate to /login
    - Add hover animation (color transition)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 12.2 Write unit tests for LogoutButton
    - Test button renders correctly
    - Test click calls logout and navigates
    - Mock AuthContext and useNavigate
    - _Requirements: 7.2, 7.3_

- [ ] 13. Set up routing and integrate authentication
  - [~] 13.1 Update App.js to include routing setup
    - Import BrowserRouter, Routes, Route from react-router-dom
    - Wrap application with AuthProvider
    - Define route for /login pointing to LoginPage
    - Wrap existing main application routes with ProtectedRoute
    - Create routes for /items, /invoice, /dashboard as protected
    - Move existing page state logic to protected routes
    - _Requirements: 1.1, 4.2, 4.3_

  - [~] 13.2 Add LogoutButton to main application header
    - Update App.js header to include LogoutButton when authenticated
    - Position button in top-right corner of header
    - Ensure button only shows on protected routes
    - _Requirements: 7.1_

  - [~] 13.3 Update index.js to include AuthProvider
    - Ensure AuthProvider wraps entire App component
    - Verify BrowserRouter is properly configured
    - _Requirements: 3.1_

- [ ] 14. Implement accessibility features
  - [~] 14.1 Add accessibility attributes to LoginPage
    - Add aria-label to input fields
    - Add aria-describedby to error messages
    - Add role="alert" to error message container
    - Ensure Tab key navigation works for all interactive elements
    - Test Enter key submits form
    - Add autoComplete="username" and autoComplete="current-password"
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.7_

  - [~] 14.2 Test and adjust color contrast for WCAG compliance
    - Verify text color contrast ratio is at least 4.5:1
    - Test focus indicators are visible on all interactive elements
    - Ensure error messages have sufficient contrast
    - _Requirements: 10.6_

- [ ] 15. Integration testing and polish
  - [ ]* 15.1 Write integration tests for complete authentication flow
    - Test full login flow from form submission to main app access
    - Test session persistence across page reloads
    - Test logout flow clearing state and redirecting
    - Test protected API calls with token
    - Test token expiration handling
    - Mock backend API responses
    - _Requirements: 2.1, 3.2, 4.1, 7.2, 3.7_

  - [~] 15.2 Test responsive design on multiple screen sizes
    - Test login page on desktop (≥1024px)
    - Test login page on tablet (768px - 1023px)
    - Test login page on mobile (<768px)
    - Verify layout adjusts appropriately
    - Ensure all functionality works across sizes
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [~] 15.3 Manual testing of animations and transitions
    - Verify wave animations play smoothly
    - Test input focus animations (border color transition)
    - Test button hover effects (elevation and color)
    - Test loading spinner animation
    - Test error message shake animation
    - Test page transition animations (fade-in, slide-up)
    - _Requirements: 1.3, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [~] 16. Final checkpoint - Comprehensive testing
  - Run all frontend and backend tests (unit, property, integration)
  - Test complete user journey: login → navigate app → logout → login again
  - Test session persistence: login → close browser → reopen → still authenticated
  - Test error scenarios: wrong password, network errors, expired token
  - Verify all animations and responsive behavior
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements from the requirements document for traceability
- Property-based tests validate universal correctness properties using fast-check (100+ iterations)
- Unit tests validate specific scenarios and integration points
- Backend tasks (1-6) should be completed before frontend tasks (7-16) to enable end-to-end testing
- The authentication system uses industry-standard practices: bcrypt for hashing, JWT for tokens, secure storage
- The marine theme provides visual cohesion with the M Marine Services brand
- Accessibility features ensure the login page meets WCAG standards and supports keyboard navigation
- Session persistence allows users to remain logged in across browser sessions
- All existing invoice and item routes will be protected after middleware is applied

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["3.1", "3.3"] },
    { "id": 3, "tasks": ["3.2", "3.4", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.4"] },
    { "id": 5, "tasks": ["4.5", "5.1"] },
    { "id": 6, "tasks": ["5.2", "5.3", "5.4", "5.5"] },
    { "id": 7, "tasks": ["7.1"] },
    { "id": 8, "tasks": ["8.1"] },
    { "id": 9, "tasks": ["8.2", "8.3", "8.4", "9.1"] },
    { "id": 10, "tasks": ["9.2", "10.1"] },
    { "id": 11, "tasks": ["10.2", "10.3", "11.1"] },
    { "id": 12, "tasks": ["11.2", "12.1"] },
    { "id": 13, "tasks": ["12.2", "13.1"] },
    { "id": 14, "tasks": ["13.2", "13.3", "14.1"] },
    { "id": 15, "tasks": ["14.2", "15.1", "15.2", "15.3"] }
  ]
}
```
