# Logistics API

A RESTful backend API for managing shipments, delivery agents and payments. Built with TypeScript, Node.js, Express and MongoDB, with Redis for caching and rate limiting.

## Live Demo

- **API Base URL:** https://logistics-api-5a93.onrender.com
- **API Documentation (Swagger):** https://logistics-api-5a93.onrender.com/api-docs
- **Health Check:** https://logistics-api-5a93.onrender.com/health

## Features

- **Authentication and authorization** — user registration, login, JWT authentication and role-based access control.
- **Shipment management** — create and retrieve shipments, generate tracking numbers and manage shipment statuses.
- **Delivery agent management** — manage delivery agents and assign shipments.
- **Payment processing** — integrate Paystack for payment initialization, verification and webhook handling.
- **Search and filtering** — filter and sort shipment records using query parameters.
- **Redis integration** — caching and rate limiting.
- **Analytics** — endpoints for shipment, payment and delivery-agent statistics.
- **API documentation** — interactive endpoint documentation using Swagger UI.
- **Centralized error handling** — consistent handling of API errors.

## Tech Stack

- TypeScript
- Node.js
- Express.js
- MongoDB and Mongoose
- Redis
- JSON Web Tokens (JWT)
- Paystack
- Swagger UI
- Git and GitHub

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB database
- Redis-compatible server
- Paystack test API keys for payment testing

### Installation

Clone the repository:

```bash
git clone https://github.com/Quadri702/logistics-api.git
cd logistics-api
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root and configure the following variables:

```env
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_connection_url
PAYSTACK_SECRET_KEY=your_paystack_test_secret_key
```

Replace the placeholder values with your own credentials. Never commit your `.env` file or expose secret keys.

### Run Locally

```bash
npm run dev
```

If your local environment uses a different development command, use the script configured in your `package.json`.

Once the server starts, open the local Swagger documentation at:

`http://localhost:5000/api-docs`

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/users` | Retrieve users |
| GET | `/api/users/{id}` | Retrieve a user by ID |
| PATCH | `/api/users/{id}/role` | Update a user's role |
| POST | `/api/shipments` | Create a shipment |
| GET | `/api/shipments` | Retrieve shipments |
| PATCH | `/api/shipments/{id}/status` | Update shipment status |
| PATCH | `/api/shipments/{id}/assign` | Assign a delivery agent |
| PATCH | `/api/shipments/{id}/agent-status` | Update an assigned shipment's status |
| POST | `/api/delivery-agents` | Create a delivery agent |
| GET | `/api/delivery-agents` | Retrieve delivery agents |
| POST | `/api/payments/initialize/{shipmentId}` | Initialize payment |
| GET | `/api/payments/verify/{reference}` | Verify payment |
| POST | `/api/payments/webhook` | Receive Paystack webhook events |
| GET | `/api/analytics/shipments` | Retrieve shipment analytics |
| GET | `/api/analytics/payments` | Retrieve payment analytics |
| GET | `/api/analytics/delivery-agents` | Retrieve delivery-agent analytics |

Some endpoints require authentication or specific user roles. See the Swagger documentation for request schemas and authorization requirements.

## Error Handling

The API uses centralized error handling to provide consistent error responses and handle unsuccessful requests.

## Deployment

The API is deployed on Render, with MongoDB Atlas for database hosting and a Redis-compatible service for caching and rate limiting.

## Future Improvements

- Automated unit and integration tests
- CI/CD workflow
- Expanded monitoring and performance optimization
- More comprehensive API usage examples

## Author

**Quadri Adelaja**

[GitHub](https://github.com/Quadri702)
