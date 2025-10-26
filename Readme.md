# Real-Time Polling Backend

## Overview

Backend for a real-time polling platform where organizers create sessions & questions, participants join via join codes and vote.

## Tech

- Node.js + TypeScript
- Express
- MongoDB (Mongoose)
- JWT auth for organizers
- Postman (API Testing)

## Setup

1. `git clone https://github.com/tejaspachgade2315/Assessment.git`
2. `npm install`
3. Copy `.env.example` -> `.env`
4. Start MongoDB locally
5. `npm run dev`
6. Server available at `http://localhost:3232`

## Deployed server

[https://assessment-ii9z.onrender.com](https://assessment-ii9z.onrender.com)


## Swagger Docs

[https://assessment-ii9z.onrender.com/api-docs](https://assessment-ii9z.onrender.com/api-docs)
## API

- Key endpoints:
  - `POST /api/user/register` — register organizer (returns JWT)
  - `POST /api/user/login` — login organizer (returns JWT)
  - `POST /api/session` — create new session/poll (auth required)
  - `GET /api/session/:id` — fetch session/poll by ID
  - `GET /api/session` — fetch all public sessions/polls
  - `PATCH /api/session/:id` — update session/poll (start, stop, or modify)
  - `GET /api/vote/join/:joinCode` — join session/poll via join code
  - `POST /api/vote` — submit vote in poll (returns 202 Accepted)
