# Updated frontend

Frontend adapted to the current Gateway/User Service/Task Service API.

## API used

Gateway: `http://localhost:8080`

- `POST /api/users/login`
- `POST /api/users/register`
- `GET /api/users/workers`
- `DELETE /api/users`
- `GET /api/tasks?email=...`
- `GET /api/tasks/completed?email=...`
- `GET /api/tasks/admin?email=...`
- `POST /api/tasks` with `{ "email": "...", "text": "..." }`
- `PUT /api/tasks/{id}/complete`
- `DELETE /api/tasks/{id}`

The frontend keeps the current architecture as a static HTML/CSS/JS application.

## Run

Start the backend/gateway with Docker Compose, then start the frontend:

```bash
npm start
```

The frontend expects the gateway on port `8080`.

`api.js` derives the gateway host from the browser hostname, so it works when the frontend is opened from localhost or another host without hard-coding `localhost` into every request.
