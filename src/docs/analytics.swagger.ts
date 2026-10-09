/**
 * @swagger
 * /api/analytics/shipments:
 *   get:
 *     summary: Get shipment analytics
 *     description: Returns total shipments and a breakdown of shipments by status.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shipment analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalShipments:
 *                       type: integer
 *                       example: 25
 *                     shipmentsByStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: DELIVERED
 *                           count:
 *                             type: integer
 *                             example: 10
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/analytics/payments:
 *   get:
 *     summary: Get payment analytics
 *     description: Returns successful payment statistics and total revenue.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       example: 125000
 *                     successfulPayments:
 *                       type: integer
 *                       example: 18
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/analytics/delivery-agents:
 *   get:
 *     summary: Get delivery agent analytics
 *     description: Returns shipment and delivery performance statistics for delivery agents.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Delivery agent analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     agents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           agentId:
 *                             type: string
 *                             example: 6ab283105c1f9b8f7650c014
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                           email:
 *                             type: string
 *                             example: john@example.com
 *                           totalShipments:
 *                             type: integer
 *                             example: 20
 *                           deliveredShipments:
 *                             type: integer
 *                             example: 15
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
