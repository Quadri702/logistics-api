/**
 * @swagger
 * /api/shipments:
 *   post:
 *     summary: Create a shipment
 *     tags:
 *       - Shipments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickupAddress
 *               - deliveryAddress
 *               - packageDescription
 *               - weight
 *               - deliveryFee
 *             properties:
 *               pickupAddress:
 *                 type: string
 *                 example: 12 University Road, Lagos
 *               deliveryAddress:
 *                 type: string
 *                 example: 25 Allen Avenue, Lagos
 *               packageDescription:
 *                 type: string
 *                 example: Electronics
 *               weight:
 *                 type: number
 *                 example: 2.5
 *               deliveryFee:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Shipment created successfully
 *       400:
 *         description: Invalid shipment data
 *       401:
 *         description: Authentication required
 */

/**
 * @swagger
 * /api/shipments:
 *   get:
 *     summary: Get shipments
 *     description: Returns shipments available to the authenticated user. Admins can view all shipments while other users can view their own shipments.
 *     tags:
 *       - Shipments
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - PENDING
 *             - CONFIRMED
 *             - ASSIGNED
 *             - PICKED_UP
 *             - IN_TRANSIT
 *             - OUT_FOR_DELIVERY
 *             - DELIVERED
 *             - DELIVERY_FAILED
 *             - RESCHEDULED
 *             - CANCELLED
 *         description: Filter shipments by status
 *         example: IN_TRANSIT
 *
 *       - in: query
 *         name: minFee
 *         schema:
 *           type: number
 *         description: Minimum delivery fee
 *         example: 2000
 *
 *       - in: query
 *         name: maxFee
 *         schema:
 *           type: number
 *         description: Maximum delivery fee
 *         example: 10000
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by pickup address, delivery address, package description or tracking number
 *         example: Lagos
 *
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field used to sort results. Prefix with "-" for descending order.
 *         example: -createdAt
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of shipments per page
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: Shipments retrieved successfully
 *       401:
 *         description: Authentication required
 *       429:
 *         description: Too many requests
 */

/**
 * @swagger
 * /api/shipments/{id}/status:
 *   patch:
 *     summary: Update shipment status
 *     tags:
 *       - Shipments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - PENDING
 *                   - CONFIRMED
 *                   - ASSIGNED
 *                   - PICKED_UP
 *                   - IN_TRANSIT
 *                   - OUT_FOR_DELIVERY
 *                   - DELIVERED
 *                   - DELIVERY_FAILED
 *                   - RESCHEDULED
 *                   - CANCELLED
 *                 example: IN_TRANSIT
 *     responses:
 *       200:
 *         description: Shipment status updated successfully
 *       400:
 *         description: Invalid status or invalid status transition
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Shipment not found
 *       409:
 *         description: Shipment is currently being updated
 */

/**
 * @swagger
 * /api/shipments/{id}/assign:
 *   patch:
 *     summary: Assign a shipment to a delivery agent
 *     description: Assigns a pending or confirmed shipment to an available delivery agent.
 *     tags:
 *       - Shipments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentId
 *             properties:
 *               agentId:
 *                 type: string
 *                 example: 6ab283105c1f9b8f7650c014
 *     responses:
 *       200:
 *         description: Shipment assigned successfully
 *       400:
 *         description: Delivery agent is unavailable or shipment cannot be assigned in its current status
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Shipment or delivery agent not found
 */

/**
 * @swagger
 * /api/shipments/{id}/agent-status:
 *   patch:
 *     summary: Update an assigned shipment status
 *     description: Allows the delivery agent assigned to a shipment to update its delivery status.
 *     tags:
 *       - Shipments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Shipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - PICKED_UP
 *                   - IN_TRANSIT
 *                   - OUT_FOR_DELIVERY
 *                   - DELIVERED
 *                   - DELIVERY_FAILED
 *                 example: OUT_FOR_DELIVERY
 *     responses:
 *       200:
 *         description: Shipment status updated successfully
 *       400:
 *         description: Invalid status or invalid status transition
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Delivery agent is not assigned to this shipment
 *       404:
 *         description: Shipment or delivery agent profile not found
 */
