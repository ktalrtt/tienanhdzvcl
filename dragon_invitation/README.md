# DRAGON INVITATION

A private yearbook invitation website with:
- Admin login configured through environment variables
- Admin-created guest accounts
- Individual display names on invitations
- Editable invitation copy
- Anime-fantasy inspired dragon/fire reveal
- SQLite persistence for users, settings, and sessions
- Password hashing, session cookies, rate limiting, and basic security headers

## Run locally

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Set a unique `SESSION_SECRET` (at least 32 characters), `ADMIN_USERNAME`, and `ADMIN_PASSWORD` (at least 12 characters).
4. Run:

   ```bash
   npm install
   npm start
   ```

5. Open `http://localhost:3000`.

## Deploy online with Render

This app needs a persistent disk because SQLite stores accounts and sessions.

1. Create a private GitHub repository and upload these project files.
2. In Render, create a **Web Service** from that repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add a persistent disk mounted at `/var/data` (at least 1 GB).
6. Set these environment variables in Render:
   - `NODE_ENV` = `production`
   - `DB_PATH` = `/var/data/invitations.sqlite`
   - `SESSION_SECRET` = a long random secret (32+ characters)
   - `ADMIN_USERNAME` = your chosen admin username
   - `ADMIN_PASSWORD` = your unique admin password (12+ characters)
7. Deploy, then open the URL Render gives you and log in with your admin credentials.

Do not commit `.env` or share your admin password. Keep the persistent disk attached; deleting it deletes the local SQLite data.

## Important notes

- The app intentionally has no public sign-up route. Only the admin can create guest accounts.
- Passwords are stored as bcrypt hashes, not plaintext.
- Use HTTPS in production (Render provides it).
- This is a starter project. Before using it for sensitive information or a large public audience, add CSRF protection, email-based password reset, audit logs, and automated backups.
- The dragon illustration is an original lightweight SVG/CSS placeholder, not a frame-by-frame animated video. The fire reveal is a CSS transition. Replace the SVG with commissioned/licensed artwork if you want a more elaborate dragon animation.
