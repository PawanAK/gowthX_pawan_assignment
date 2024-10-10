# Assignment Submission Portal API

This is the backend API for an Assignment Submission Portal, built with Node.js, Express, and MongoDB.

## Prerequisites

Before you begin, ensure you have met the following requirements:

* You have installed Node.js (version 12.x or higher)
* You have a MongoDB database set up (local or cloud-based)

## Installing Assignment Submission Portal API

To install the Assignment Submission Portal API, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/PawanAK/gowthX_pawan_assignment.git
   ```

2. Navigate to the project directory:
   ```
   cd gowthX_pawan_assignment
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   MONGODB_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-jwt-secret>
   ```
   Replace `<your-mongodb-connection-string>` with your actual MongoDB connection string and `<your-jwt-secret>` with a secure random string for JWT encryption.

## Running Assignment Submission Portal API

To run the Assignment Submission Portal API, follow these steps:

1. For development (with auto-restart on file changes):
   ```
   npm run dev
   ```

2. For production:
   ```
   npm start
   ```

The server will start running on `http://localhost:3000` (or the port you specified in the .env file).

## API Endpoints

### User Routes
- `POST /api/users/register`: Register a new user
- `POST /api/users/login`: Login for existing user
- `GET /api/users/admins`: Get list of admin users (requires 
authentication)
- `POST /api/users/upload`: Submit a new assignment (requires 
authentication)

#### Register a new user
- **POST** `/api/users/register`
- **Request Body:**
  ```json
  {
    "username": "newuser",
    "password": "password123",
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "User registered successfully"
  }
  ```

#### Login for existing user
- **POST** `/api/users/login`
- **Request Body:**
  ```json
  {
    "username": "existinguser",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ecb54b24a1234567890a",
      "username": "existinguser",
      "role": "user"
    }
  }
  ```

#### Get list of admin users (requires authentication)
- **GET** `/api/users/admins`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "admins": [
      {
        "id": "60d5ecb54b24a1234567890b",
        "username": "admin1"
      },
      {
        "id": "60d5ecb54b24a1234567890c",
        "username": "admin2"
      }
    ]
  }
  ```

#### Submit a new assignment (requires authentication)
- **POST** `/api/users/upload`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "task": "Complete project documentation",
    "adminId": "60d5ecb54b24a1234567890b"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Assignment submitted successfully",
    "assignment": {
      "id": "60d5ecb54b24a1234567890d",
      "task": "Complete project documentation",
      "status": "pending",
      "admin": "60d5ecb54b24a1234567890b"
    }
  }
  ```

### Admin Routes

#### Register a new admin
- **POST** `/api/admin/register`
- **Request Body:**
  ```json
  {
    "username": "newadmin",
    "password": "adminpass123",
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Admin registered successfully"
  }
  ```

#### Login for admin
- **POST** `/api/admin/login`
- **Request Body:**
  ```json
  {
    "username": "existingadmin",
    "password": "adminpass123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ecb54b24a1234567890e",
      "username": "existingadmin",
      "role": "admin"
    }
  }
  ```

#### Get all assignments for the admin (requires authentication)
- **GET** `/api/admin/assignments`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "assignments": [
      {
        "id": "60d5ecb54b24a1234567890f",
        "task": "Review code changes",
        "status": "pending",
        "userId": "60d5ecb54b24a1234567890a"
      },
      {
        "id": "60d5ecb54b24a1234567891g",
        "task": "Update database schema",
        "status": "accepted",
        "userId": "60d5ecb54b24a1234567890b"
      }
    ]
  }
  ```

#### Accept an assignment (requires authentication)
- **POST** `/api/admin/assignments/:id/accept`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "message": "Assignment accepted successfully",
    "assignment": {
      "id": "60d5ecb54b24a1234567890f",
      "task": "Review code changes",
      "status": "accepted",
      "userId": "60d5ecb54b24a1234567890a"
    }
  }
  ```

#### Reject an assignment (requires authentication)
- **POST** `/api/admin/assignments/:id/reject`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "message": "Assignment rejected successfully",
    "assignment": {
      "id": "60d5ecb54b24a1234567890f",
      "task": "Review code changes",
      "status": "rejected",
      "userId": "60d5ecb54b24a1234567890a"
    }
  }
  ```

## Project Structure

- `src/`: Source code directory
  - `controllers/`: Request handlers
  - `models/`: Database models
  - `routes/`: API routes
  - `middleware/`: Custom middleware
  - `utils/`: Utility functions
  - `server.js`: Main application file


