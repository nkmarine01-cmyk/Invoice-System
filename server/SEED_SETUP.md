# Initial User Seed Setup

This document explains how to create the initial owner/admin user for the M Marine Services invoice management system.

## Prerequisites

1. MongoDB must be running (local or remote)
2. Environment variables must be configured in `server/.env`
3. Required dependencies must be installed: `npm install`

## Running the Seed Script

The seed script creates an initial user account with default credentials.

### Step 1: Ensure MongoDB is Running

Make sure your MongoDB instance is accessible at the connection string specified in your `.env` file.

### Step 2: Run the Seed Command

From the `server` directory, run:

```bash
npm run seed:user
```

Or directly:

```bash
node seedUser.js
```

### Step 3: Verify Success

You should see output similar to:

```
MongoDB connected successfully
Hashing password...
✅ Initial user created successfully!

Login Credentials:
==================
Username: admin
Password: admin123

⚠️  IMPORTANT: Change this password after first login in production!
```

## Default Credentials

- **Username:** `admin`
- **Password:** `admin123`

## Important Notes

1. **Security:** The default password (`admin123`) is for initial setup only. Change it immediately after first login in production environments.

2. **Idempotent:** The script checks if a user already exists. If the admin user is already in the database, the script will skip creation and notify you.

3. **Password Hashing:** Passwords are hashed using bcrypt with 10 salt rounds before being stored in the database. Plain text passwords are never stored.

4. **One-Time Setup:** This script only needs to be run once during initial system setup.

## Troubleshooting

### "MongoDB connection error"

- Verify MongoDB is running
- Check your `MONGO_URI` in the `.env` file
- Ensure network connectivity to MongoDB

### "User already exists"

- The admin user has already been created
- If you need to reset the password, manually delete the user from MongoDB first:
  ```javascript
  // In MongoDB shell or Compass
  db.users.deleteOne({ username: "admin" })
  ```
  Then run the seed script again.

### "Error creating user"

- Check the error message for details
- Verify the User model schema is properly defined
- Ensure bcryptjs is installed: `npm list bcryptjs`

## Technical Details

### What the Script Does

1. Connects to MongoDB using the connection string from `.env`
2. Checks if a user with username "admin" already exists
3. If not exists:
   - Hashes the password "admin123" using bcrypt (10 rounds)
   - Creates a new User document with username and passwordHash
   - Saves the user to the database
4. Displays the login credentials
5. Exits with success code

### File Location

- Script: `server/seedUser.js`
- User Model: `server/models/User.js`
- Database Config: `server/config/db.js`

### Dependencies

- `mongoose`: Database ORM
- `bcryptjs`: Password hashing
- `dotenv`: Environment variable management

## Next Steps

After seeding the initial user:

1. Start the server: `npm start` or `npm run dev`
2. Navigate to the login page
3. Use the credentials shown above to log in
4. **Change the default password immediately in production!**
