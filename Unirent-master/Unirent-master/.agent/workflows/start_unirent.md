---
description: Start the UniRent application (Backend + Vite Client)
---

# Start UniRent

This workflow starts the UniRent application, ensuring the correct Vite client is used instead of the root Next.js application.

1.  **Start Backend Server**
    -   Target: `server/`
    -   Command: `npm start`
    -   Port: 5000

    ```bash
    cd server
    npm start
    ```

2.  **Start Frontend Client (Vite)**
    -   Target: `client/`
    -   Command: `npm run dev`
    -   Port: 5173

    ```bash
    cd client
    npm run dev
    ```

> [!NOTE]
> Do NOT run `npm run dev` in the root directory. That launches a different Next.js application (GoCart) which is not the correct frontend for UniRent.
