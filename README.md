# Identity Reconciliation System

This is a Node.js + Express web service written in TypeScript that solves the problem of identity reconciliation. The system allows multiple purchases or interactions with different pieces of contact information to be tied back to the same person.

It exposes a simple REST API to resolve user identity across different datasets by linking and clustering user details (email and phone number). 

## Technology Stack

* **Language**: TypeScript
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database Toolkit**: Prisma ORM
* **Database**: PostgreSQL (Neon)

## Prerequisites

- Node.js (v18+)
- npm or yarn
- A PostgreSQL Database (e.g., [Neon](https://neon.tech/))

## Setup Instructions

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root of the project to define the database connection.
   ```env
   DATABASE_URL="postgres://<user>:<password>@<host>/<database>?sslmode=require"
   ```

3. **Initialize the Database:**
   Generate Prisma client and push the schema to your database.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the Application Locally:**
   ```bash
   npm run dev
   ```
   The application should now be running on `http://localhost:3000`.

## API Documentation

### \`POST /identify\`

This endpoint accepts a user's contact information (email and/or phone number) and reconciles it against existing contacts.

**Request Payload:**
```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```
*(At least one of `email` or `phoneNumber` must be provided)*

**Response Payload:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["mcfly@hillvalley.edu", "lorraine@hillvalley.edu"],
    "phoneNumbers": ["123456", "789123"],
    "secondaryContactIds": [2, 3]
  }
}
```

