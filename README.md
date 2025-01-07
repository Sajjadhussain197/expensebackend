# Expense Tracker API

## Overview

This is an API for tracking expenses. It allows users to register, log in, manage their expenses, and retrieve summaries of their expenses. The application also includes an admin route for summarizing all expenses.

## API Endpoints

### **Authentication Endpoints** (`/api/v1/auth`)

- **POST /register**
  - Registers a new user.
  - **Body Parameters**:
    - `username`: (String) The username of the user.
    - `email`: (String) The user's email address.
    - `password`: (String) The user's password.
  - **Success Response**:
    - Status: `201 Created`
    - Body:
      ```json
      {
        "message": "User registered successfully"
      }
      ```

- **POST /login**
  - Logs in a user and generates a JWT token.
  - **Body Parameters**:
    - `email`: (String) The user's email address.
    - `password`: (String) The user's password.
  - **Success Response**:
    - Status: `200 OK`
    - Body:
      ```json
      {
        "message": "Login successful",
        "token": "JWT_TOKEN"
      }
      ```

- **GET /profile/:id**
  - Retrieves the profile of the logged-in user.
  - **Params**:
    - `id`: (String) The user's unique ID.
  - **Success Response**:
    - Status: `200 OK`
    - Body:
      ```json
      {
        "user": {
          "id": "userId",
          "username": "username",
          "email": "email"
        }
      }
      ```

### **Expense Endpoints** (`/api/v1/expense`)

- **POST /create**
  - Creates a new expense.
  - **Body Parameters**:
    - `amount`: (Number) The expense amount in cents (e.g., 1000 for $10).
    - `category`: (String) The category of the expense (e.g., "Food", "Transportation").
    - `description`: (String) A description of the expense.
    - `date`: (String) The date of the expense (e.g., `2025-01-07`).
  - **Authentication Required**: Yes (JWT required in headers).
  - **Success Response**:
    - Status: `200 OK`
    - Body:
      ```json
      {
        "message": "Expense created successfully",
        "data": { /* expense object */ }
      }
      ```

- **GET /getexpense**
  - Retrieves a specific expense by `owner_id`.
  - **Query Parameters**:
    - `owner_id`: (String) The unique ID of the user.
  - **Authentication Required**: Yes (JWT required in headers).
  - **Success Response**:
    - Status: `200 OK`
    - Body:
      ```json
      {
        "message": "Expense fetched successfully",
        "data": { /* expense object */ }
      }
      ```

- **GET /getall**
  - Retrieves all expenses for a user, with pagination and filtering.
  - **Query Parameters**:
    - `start_date`: (String) The start date for filtering (e.g., `2025-01-01`).
    - `end_date`: (String) The end date for filtering (e.g., `2025-12-31`).
    - `category`: (String) The expense category to filter by.
    - `amount_min`: (Number) The minimum amount for filtering.
    - `amount_max`: (Number) The maximum amount for filtering.
    - `page`: (Number) The page of results (default: 1).
    - `limit`: (Number) The number of results per page (default: 10).
  - **Authentication Required**: Yes (JWT required in headers).
  - **Success Response**:
    - Status: `200 OK`
    - Body:
      ```json
      {
        "message": "Expenses fetched successfully",
        "data": [{/* array of expenses */}],
        "pagination": { "total": 100, "page": 1, "limit": 10 }
      }
      ```

- **PUT /update/:id**
  - Updates an existing expense.
  - **Params**:
    - `id`: (String) The unique ID of the expense.
  - **Body Parameters** (optional):
    - `amount`: (Number) The new expense amount in cents.
    - `category`: (String) The new category of the expense.
    - `description`: (String) The new description of the expense.
    - `date`: (String) The new date of the expense.
  - **Authentication Required**: Yes (JWT required in headers).
  - **Success Response**:
    - Status: `200 OK`
    - Body:
      ```json
      {
        "message": "Expense updated successfully",
        "data": { /* updated expense object */ }
      }
      ```

- **DELETE /delete/:id**
  - Deletes an expense.
  - **Params**:
    - `id`: (String) The unique ID of the expense.
  - **Authentication Required**: Yes (JWT required in headers).
  - **Success Response**:
    - Status: `200 OK`
    - Body:
      ```json
      {
        "message": "Expense deleted successfully"
      }
      ```

- **GET /getexpensebysummary**
  - Retrieves a summary of expenses for a given date range (Admin access only).
  - **Query Parameters**:
    - `start_date`: (String) The start date for the summary.
    - `end_date`: (String) The end date for the summary.
  - **Authentication Required**: Yes (JWT required in headers, Admin role).
  - **Success Response**:
    - Status: `200 OK`
    - Body:
      ```json
      {
        "message": "Expense summary fetched successfully",
        "data": {
          "total_expenses": 50000,
          "categories": {
            "Food": 20000,
            "Transportation": 15000
          },
          "highest_category": "Food",
          "top_3_expenses": [{/* expense objects */}]
        }
      }
      ```

## Running the Application Locally

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or MongoDB Atlas)

### Setup

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd <repository_name>
