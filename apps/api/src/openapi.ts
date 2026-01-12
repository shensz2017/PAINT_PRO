import swaggerJsdoc from "swagger-jsdoc";

export const openapiSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Image Studio API",
      version: "0.1.0",
      description: "Minimal API for AI Image Studio MVP."
    }
  },
  apis: ["./src/index.ts"]
});
