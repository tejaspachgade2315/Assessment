import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Application } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Assessment API",
      version: "1.0.0",
      description: "API documentation for Assessment",
    },
    servers: [
      {
        url: "http://localhost:3232",
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
      schemas: {
        User: {
          type: "object",
          required: [
            "name",
            "email",
            "password",
            "role",
            "gender",
            "phone",
            "address",
            "startDate",
            "endDate",
            "package",
          ],
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            image: { type: "string" },
            role: { type: "string" },
            isActive: { type: "boolean" },
            gender: { type: "string" },
            age: { type: "number" },
            height: { type: "number" },
            weight: { type: "number" },
            adminId: { type: "object" },
            trainerId: { type: "object" },
            phone: { type: "string" },
            address: { type: "string" },
            startDate: { type: "string" },
            endDate: { type: "string" },
            package: { type: "string" },
            date: { type: "string", format: "date-time" },
            activityCount: { type: "number" },
            time: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
          example: {
            name: "jey",
            email: "jey@example.com",
            password: "12345678",
            image: "https://example.com/profile.jpg",
            role: "member",
            isActive: true,
            gender: "male",
            age: 25,
            height: 175,
            weight: 70,
            adminId: "679722ff0417db0fc7c15a26",
            trainerId: "679722ff0417db0fc7c15a26",
            phone: "1234567890",
            address: "123 Main Street, Springfield, USA",
            startDate: "2023-10-01T00:00:00.000Z",
            endDate: "2023-10-01T00:00:00.000Z",
            package: "679722ff0417db0fc7c15a26",
            date: "2023-10-01T00:00:00.000Z",
            activityCount: 1,
            time: "2023-10-01T00:00:00.000Z",
            createdAt: "2023-10-01T00:00:00.000Z",
            updatedAt: "2023-10-01T00:00:00.000Z",
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/models/*.ts"], // Files containing annotations for the OpenAPI Specification
};

const specs = swaggerJsdoc(options);

export default (app: Application): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
