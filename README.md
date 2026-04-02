# Finance Backend

This is my backend implementation for the **Finance Data Processing and Access Control** assignment.

I built this project to cover the core requirements: user/role handling, financial records CRUD, dashboard summaries, role-based permissions, validation, and SQLite persistence.

## What this project does

- Manage users with role and status
- Store and manage financial records
- Filter records by type/category/date range
- Return dashboard-level summary data
- Restrict access by role (`viewer`, `analyst`, `admin`)
- Validate input and return proper API errors

## Tech stack

- Node.js
- Express.js
- SQLite

## Project structure

```text
finance-backend/
+-- app.js
+-- index.js
+-- db.js
+-- controllers/
|   +-- userController.js
|   +-- recordController.js
|   +-- dashboardController.js
+-- routes/
|   +-- userRoutes.js
|   +-- recordRoutes.js
|   +-- dashboardRoutes.js
+-- middleware/
|   +-- auth.js
+-- package.json
+-- README.md
```

## How to run

```bash
npm install
npm start
```

Expected console output:

```text
Connected to SQLite database
Server running on port 3000
```

Base URL: `http://localhost:3000`

Health check:
- `GET /`
- Response: `Backend is running`

## Database design

### `users`
- `id` (PK)
- `name`
- `email` (unique)
- `role`
- `status`

### `records`
- `id` (PK)
- `amount`
- `type` (`income` or `expense`)
- `category`
- `date` (`YYYY-MM-DD`)
- `notes`
- `user_id` (FK -> `users.id`)

## Roles and access control

I used a simple role header for assignment-friendly testing:

`x-user-role: viewer | analyst | admin`

Access rules:
- `admin`: full access to users, records, and dashboard
- `analyst`: read records + dashboard
- `viewer`: dashboard only

If role header is missing:

```json
{ "error": "No role provided" }
```

If role is not allowed:

```json
{ "error": "Access denied" }
```

## API overview

## Users (admin only)

- `POST /users`
- `GET /users`
- `PATCH /users/:id/status`

Example request to create a user:

```json
{
  "name": "John",
  "email": "john@example.com",
  "role": "analyst",
  "status": "active"
}
```

Example request to update status:

```json
{
  "status": "inactive"
}
```

## Records

- `POST /records` (admin)
- `GET /records` (admin, analyst)
- `PUT /records/:id` (admin)
- `DELETE /records/:id` (admin)

Example create request:

```json
{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2026-04-02",
  "notes": "April salary",
  "user_id": 1
}
```

Example update request:

```json
{
  "amount": 5200,
  "type": "income",
  "category": "salary",
  "date": "2026-04-02",
  "notes": "Updated salary"
}
```

### Record filters

Supported query params on `GET /records`:
- `type`
- `category`
- `startDate`
- `endDate`

Examples:
- `/records?type=income`
- `/records?category=food`
- `/records?startDate=2026-04-01&endDate=2026-04-30`

## Dashboard

- `GET /dashboard` (viewer, analyst, admin)

Returns:
- total income
- total expense
- net balance
- category totals
- recent activity
- monthly trends

Example response:

```json
{
  "totalIncome": 9000,
  "totalExpense": 1200,
  "netBalance": 7800,
  "categoryTotals": [
    { "category": "salary", "total": 9000 },
    { "category": "shopping", "total": 1000 },
    { "category": "food", "total": 200 }
  ],
  "recentActivity": [],
  "monthlyTrends": []
}
```

## Validation and errors

What is validated:
- required fields
- valid role/status/type values
- date format (`YYYY-MM-DD`)
- positive amount
- duplicate email
- not-found checks for update/delete

Status codes used:
- `200` success
- `201` created
- `400` validation error
- `401` missing role header
- `403` role blocked
- `404` not found
- `409` duplicate email
- `500` server/database error

## Postman test flow I used

1. Create an admin user (`POST /users` with `x-user-role: admin`)
2. Create analyst and viewer users
3. Add records as admin
4. Check analyst can read records but cannot create/update/delete
5. Check viewer can access dashboard
6. Test record filters
7. Verify dashboard totals and trend output

## Detailed Postman test cases

Use base URL:
- `http://localhost:3000`

For protected routes, send header:
- `x-user-role: <role>`

### Test Case 1: Health check
- Method: `GET`
- URL: `/`
- Header: none
- Expected status: `200`
- Expected body: `Backend is running`

### Test Case 2: Create admin user (bootstrap)
- Method: `POST`
- URL: `/users`
- Header: `x-user-role: admin`
- Body:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "status": "active"
}
```
- Expected status: `201`
- Expected response contains:
```json
{
  "message": "User created successfully",
  "userId": 1
}
```

### Test Case 3: Create analyst user
- Method: `POST`
- URL: `/users`
- Header: `x-user-role: admin`
- Body:
```json
{
  "name": "Analyst User",
  "email": "analyst@example.com",
  "role": "analyst",
  "status": "active"
}
```
- Expected status: `201`

### Test Case 4: Create viewer user
- Method: `POST`
- URL: `/users`
- Header: `x-user-role: admin`
- Body:
```json
{
  "name": "Viewer User",
  "email": "viewer@example.com",
  "role": "viewer",
  "status": "active"
}
```
- Expected status: `201`

### Test Case 5: Duplicate email validation
- Method: `POST`
- URL: `/users`
- Header: `x-user-role: admin`
- Body:
```json
{
  "name": "Admin Duplicate",
  "email": "admin@example.com",
  "role": "admin",
  "status": "active"
}
```
- Expected status: `409`
- Expected body:
```json
{ "error": "Email already exists" }
```

### Test Case 6: Create record as admin
- Method: `POST`
- URL: `/records`
- Header: `x-user-role: admin`
- Body:
```json
{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2026-04-01",
  "notes": "April salary",
  "user_id": 1
}
```
- Expected status: `201`

### Test Case 7: Create expense record as admin
- Method: `POST`
- URL: `/records`
- Header: `x-user-role: admin`
- Body:
```json
{
  "amount": 200,
  "type": "expense",
  "category": "food",
  "date": "2026-04-02",
  "notes": "Lunch",
  "user_id": 1
}
```
- Expected status: `201`

### Test Case 8: Analyst can read records
- Method: `GET`
- URL: `/records`
- Header: `x-user-role: analyst`
- Expected status: `200`
- Expected response: array of records

### Test Case 9: Analyst cannot delete records
- Method: `DELETE`
- URL: `/records/1`
- Header: `x-user-role: analyst`
- Expected status: `403`
- Expected body:
```json
{ "error": "Access denied" }
```

### Test Case 10: Viewer cannot create records
- Method: `POST`
- URL: `/records`
- Header: `x-user-role: viewer`
- Body: use any valid record payload
- Expected status: `403`

### Test Case 11: Filter by type
- Method: `GET`
- URL: `/records?type=income`
- Header: `x-user-role: analyst`
- Expected status: `200`
- Expected response: only `income` records

### Test Case 12: Filter by category
- Method: `GET`
- URL: `/records?category=food`
- Header: `x-user-role: analyst`
- Expected status: `200`
- Expected response: only `food` category records

### Test Case 13: Filter by date range
- Method: `GET`
- URL: `/records?startDate=2026-04-01&endDate=2026-04-30`
- Header: `x-user-role: analyst`
- Expected status: `200`

### Test Case 14: Update record as admin
- Method: `PUT`
- URL: `/records/1`
- Header: `x-user-role: admin`
- Body:
```json
{
  "amount": 5200,
  "type": "income",
  "category": "salary",
  "date": "2026-04-01",
  "notes": "Updated salary"
}
```
- Expected status: `200`
- Expected body:
```json
{ "message": "Record updated successfully" }
```

### Test Case 15: Delete record as admin
- Method: `DELETE`
- URL: `/records/2`
- Header: `x-user-role: admin`
- Expected status: `200`
- Expected body:
```json
{ "message": "Record deleted successfully" }
```

### Test Case 16: Viewer can access dashboard
- Method: `GET`
- URL: `/dashboard`
- Header: `x-user-role: viewer`
- Expected status: `200`
- Expected fields in response:
  - `totalIncome`
  - `totalExpense`
  - `netBalance`
  - `categoryTotals`
  - `recentActivity`
  - `monthlyTrends`

### Test Case 17: Missing role header on protected route
- Method: `GET`
- URL: `/records`
- Header: none
- Expected status: `401`
- Expected body:
```json
{ "error": "No role provided" }
```

### Test Case 18: Invalid record type validation
- Method: `POST`
- URL: `/records`
- Header: `x-user-role: admin`
- Body:
```json
{
  "amount": 100,
  "type": "bonus",
  "category": "other",
  "date": "2026-04-05",
  "notes": "Invalid type test",
  "user_id": 1
}
```
- Expected status: `400`
- Expected body:
```json
{ "error": "type must be income or expense" }
```

### Test Case 19: Invalid date format validation
- Method: `POST`
- URL: `/records`
- Header: `x-user-role: admin`
- Body:
```json
{
  "amount": 100,
  "type": "expense",
  "category": "food",
  "date": "04-05-2026",
  "notes": "Invalid date test",
  "user_id": 1
}
```
- Expected status: `400`
- Expected body:
```json
{ "error": "date must be YYYY-MM-DD" }
```

### Test Case 20: Update non-existing record
- Method: `PUT`
- URL: `/records/99999`
- Header: `x-user-role: admin`
- Body:
```json
{
  "amount": 1000,
  "type": "income",
  "category": "salary",
  "date": "2026-04-06",
  "notes": "Not found test"
}
```
- Expected status: `404`
- Expected body:
```json
{ "error": "Record not found" }
```

## Notes and assumptions

- For this assignment, authentication is mocked using `x-user-role` header to keep focus on business logic and access control.
- SQLite was chosen for quick local setup and persistence.
- Date values are stored as `YYYY-MM-DD` text.

## Requirement coverage (quick check)

- User and role management: done
- Records CRUD + filters: done
- Dashboard summary APIs: done
- Access control logic: done
- Validation and error handling: done
- Data persistence: done (SQLite)

This project is intentionally focused on clarity and assignment requirements rather than production-level complexity.
