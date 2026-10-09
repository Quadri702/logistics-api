/**
 * @swagger
 * /api/delivery-agents:
 *   post:
 *     summary: Create a delivery agent
 *     description: Creates a delivery agent profile for an existing user.
 *     tags:
 *       - Delivery Agents
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - phone
 *               - vehicleType
 *               - vehicleNumber
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 6ab280ba5c1f9b8f7650c013
 *               phone:
 *                 type: string
 *                 example: 08012345678
 *               vehicleType:
 *                 type: string
 *                 example: BIKE
 *               vehicleNumber:
 *                 type: string
 *                 example: LAG-123-XY
 *     responses:
 *       201:
 *         description: Delivery agent created successfully
 *       400:
 *         description: Invalid user role or delivery agent already exists
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/delivery-agents:
 *   get:
 *     summary: Get all delivery agents
 *     description: Returns all delivery agents with their associated user information.
 *     tags:
 *       - Delivery Agents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Delivery agents retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
