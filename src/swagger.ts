import { Application } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Real-Time Polling Platform API",
      version: "1.0.0",
      description:
        "API documentation for Real-Time Polling Platform backend assignment",
    },
    servers: [
      {
        url: "http://localhost:3232",
        description: "Local server",
      },
      {
        url: "https://assessment-ii9z.onrender.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      // -------- USER ROUTES ----------
      "/api/user/register": {
        post: {
          summary: "Register a new organizer/user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Tejas Pachgade" },
                    email: {
                      type: "string",
                      example: "tejaspachgade2315@gmail.com",
                    },
                    password: { type: "string", example: "Pass@123" },
                    role: { type: "string", example: "Organizer" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "User registered successfully",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    message: "Organizer registered successfully",
                  },
                },
              },
            },
          },
        },
      },

      "/api/user/login": {
        post: {
          summary: "Login user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: {
                      type: "string",
                      example: "tejaspachgade2315@gmail.com",
                    },
                    password: { type: "string", example: "Pass@123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Successful login",
              content: {
                "application/json": {
                  example: {
                    message: "Login successful",
                    success: true,
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
                  },
                },
              },
            },
          },
        },
      },

      // -------- SESSION ROUTES ----------
      "/api/session": {
        post: {
          summary: "Create a new session (auth required)",
          tags: ["Sessions"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  example: {
                    title: "Session title",
                    questions: [
                      {
                        text: "Q1",
                        options: [{ text: "A" }, { text: "B" }],
                      },
                      {
                        text: "Q2",
                        multiple: true,
                        options: [{ text: "X" }, { text: "Y" }, { text: "Z" }],
                      },
                    ],
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Session created successfully",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    session: {
                      organizer: "68fc8cc02dad615ff3bd4f4a",
                      title: "Session title",
                      joinCode: "83BF17",
                      isActive: false,
                      questions: [
                        {
                          id: "630a348bcccde78f",
                          text: "Q1",
                          options: [
                            { id: "a7b1917ecced6388", text: "A", votes: 0 },
                            { id: "630a8982faf783be", text: "B", votes: 0 },
                          ],
                        },
                      ],
                      createdAt: "2025-10-26T05:34:42.732Z",
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          summary: "Fetch all public sessions",
          tags: ["Sessions"],
          responses: {
            200: {
              description: "List of public sessions",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    sessions: [
                      {
                        _id: "68fcb978958064b212aa53a3",
                        title: "Session title",
                        joinCode: "313D6C",
                        isActive: true,
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },

      "/api/session/{id}": {
        get: {
          summary: "Fetch a session by ID",
          tags: ["Sessions"],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68fcb978958064b212aa53a3",
            },
          ],
          responses: {
            200: {
              description: "Session fetched successfully",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    session: {
                      _id: "68fcb978958064b212aa53a3",
                      title: "Session title",
                      joinCode: "313D6C",
                      isActive: true,
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          summary: "Update (start/stop/modify) a session",
          tags: ["Sessions"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "68fcb978958064b212aa53a3",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  example: { isActive: true },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Session updated successfully",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    session: {
                      _id: "68fcb978958064b212aa53a3",
                      isActive: true,
                    },
                  },
                },
              },
            },
          },
        },
      },

      // -------- VOTE ROUTES ----------
      "/api/vote/join/{joinCode}": {
        get: {
          summary: "Join a poll using join code",
          tags: ["Voting"],
          parameters: [
            {
              name: "joinCode",
              in: "path",
              required: true,
              schema: { type: "string" },
              example: "313D6C",
            },
          ],
          responses: {
            200: {
              description: "Session joined successfully",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    session: {
                      id: "68fcb978958064b212aa53a3",
                      title: "Session title",
                      joinCode: "313D6C",
                    },
                    participantId: "3cdcc095-b90b-4878-8f24-73b8ddaec946",
                  },
                },
              },
            },
          },
        },
      },

      "/api/vote": {
        post: {
          summary: "Submit vote in poll",
          tags: ["Voting"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  example: {
                    joinCode: "313D6C",
                    participantId: "3cdcc095-b90b-4878-8f24-73b8ddaec946",
                    answers: [
                      {
                        questionId: "05f51b11e97ce2db",
                        optionId: "078955c86e94ab85",
                      },
                    ],
                  },
                },
              },
            },
          },
          responses: {
            202: {
              description: "Vote accepted for processing",
              content: {
                "application/json": {
                  example: {
                    success: true,
                    message: "Votes accepted for processing",
                    accepted: 0,
                    skipped: [
                      {
                        questionId: "05f51b11e97ce2db",
                        reason: "Participant already voted this question",
                      },
                    ],
                    participantId: "3cdcc095-b90b-4878-8f24-73b8ddaec946",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

export default (app: Application): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
