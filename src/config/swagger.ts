import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",

  info: {
    title: "Logistics API",
    version: "1.0.0",
    description:
      "REST API for managing shipments, delivery agents, payments and logistics operations.",
  },

  servers: [
    {
      url:
        process.env.NODE_ENV === "production"
          ? "https://logistics-api-5a93.onrender.com"
          : "http://localhost:5000",
      description:
        process.env.NODE_ENV === "production"
          ? "Production server"
          : "Local development server",
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
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ["./src/docs/*.ts"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
