import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import Shipment from "../models/shipment.model.js";
import DeliveryAgent from "../models/deliveryAgent.model.js";
import generateTrackingNumber from "../utils/trackingNumber.js";
import type { ShipmentStatus } from "../models/shipment.model.js";
import { isValidStatusTransition } from "../utils/shipmentStatus.js";
import { getRedisValue, setRedisValue } from "../services/redis.service.js";
import { deleteShipmentCache } from "../services/redis.service.js";

export const createShipment = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const {
    pickupAddress,
    deliveryAddress,
    packageDescription,
    weight,
    deliveryFee,
  } = req.body;

  if (!req.userId) {
    res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });

    return;
  }

  const trackingNumber = generateTrackingNumber();

  const shipment = await Shipment.create({
    customer: req.userId,
    pickupAddress,
    deliveryAddress,
    packageDescription,
    weight,
    deliveryFee,
    trackingNumber,
    statusHistory: [
      {
        status: "PENDING",
        changedAt: new Date(),
      },
    ],
  });

  await deleteShipmentCache();

  res.status(201).json({
    status: "success",
    message: "Shipment created successfully",
    data: {
      shipment,
    },
  });
};

export const getShipments = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });

    return;
  }

  const filter: Record<string, unknown> =
    req.userRole === "admin" ? {} : { customer: req.userId };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.minFee || req.query.maxFee) {
    const feeFilter: Record<string, number> = {};

    if (req.query.minFee) {
      feeFilter.$gte = Number(req.query.minFee);
    }

    if (req.query.maxFee) {
      feeFilter.$lte = Number(req.query.maxFee);
    }

    filter.deliveryFee = feeFilter;
  }

  if (req.query.search) {
    const search = String(req.query.search);

    filter.$or = [
      {
        pickupAddress: {
          $regex: search,
          $options: "i",
        },
      },
      {
        deliveryAddress: {
          $regex: search,
          $options: "i",
        },
      },
      {
        packageDescription: {
          $regex: search,
          $options: "i",
        },
      },
      {
        trackingNumber: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  let sort = "-createdAt";

  if (req.query.sort) {
    sort = String(req.query.sort);
  }

  let page = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10;

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 10;
  }

  if (limit > 100) {
    limit = 100;
  }

  const skip = (page - 1) * limit;

  const cacheKey = `shipments:${req.userId}:${req.query.status || ""}:${req.query.minFee || ""}:${req.query.maxFee || ""}:${req.query.search || ""}:${sort}:${page}:${limit}`;

  const cachedData = await getRedisValue(cacheKey);

  if (cachedData) {
    res.status(200).json(JSON.parse(cachedData));
    return;
  }

  const shipments = await Shipment.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalResults = await Shipment.countDocuments(filter);

  const totalPages = Math.ceil(totalResults / limit);

  const responseData = {
    status: "success",
    results: shipments.length,
    pagination: {
      currentPage: page,
      totalPages,
      totalResults,
      resultsPerPage: limit,
    },
    data: {
      shipments,
    },
  };

  await setRedisValue(cacheKey, JSON.stringify(responseData), 300);

  res.status(200).json(responseData);
};

export const updateShipmentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });

    return;
  }

  const { status } = req.body;

  const shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    res.status(404).json({
      status: "fail",
      message: "Shipment not found",
    });

    return;
  }

  const allowedStatuses: ShipmentStatus[] = [
    "PENDING",
    "CONFIRMED",
    "ASSIGNED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "DELIVERY_FAILED",
    "RESCHEDULED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(status)) {
    res.status(400).json({
      status: "fail",
      message: "Invalid shipment status",
    });

    return;
  }

  const validTransition = isValidStatusTransition(shipment.status, status);

  if (!validTransition) {
    res.status(400).json({
      status: "fail",
      message: `Cannot change shipment status from ${shipment.status} to ${status}`,
    });

    return;
  }

  shipment.status = status;

  shipment.statusHistory.push({
    status,
    changedAt: new Date(),
  });

  await shipment.save();

  await deleteShipmentCache();

  res.status(200).json({
    status: "success",
    message: "Shipment status updated successfully",
    data: {
      shipment,
    },
  });
};

export const assignShipmentToAgent = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });

    return;
  }

  const { agentId } = req.body;

  const shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    res.status(404).json({
      status: "fail",
      message: "Shipment not found",
    });

    return;
  }

  const deliveryAgent = await DeliveryAgent.findById(agentId);

  if (!deliveryAgent) {
    res.status(404).json({
      status: "fail",
      message: "Delivery agent not found",
    });

    return;
  }

  if (deliveryAgent.availability !== "AVAILABLE") {
    res.status(400).json({
      status: "fail",
      message: "Delivery agent is not available",
    });

    return;
  }

  if (shipment.status !== "PENDING" && shipment.status !== "CONFIRMED") {
    res.status(400).json({
      status: "fail",
      message: "Shipment cannot be assigned in its current status",
    });

    return;
  }

  shipment.assignedAgent = deliveryAgent._id;

  shipment.status = "ASSIGNED";

  shipment.statusHistory.push({
    status: "ASSIGNED",
    changedAt: new Date(),
  });

  deliveryAgent.availability = "BUSY";

  await shipment.save();
  await deliveryAgent.save();

  res.status(200).json({
    status: "success",
    message: "Shipment assigned to delivery agent successfully",
    data: {
      shipment,
    },
  });
};

export const updateAssignedShipmentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      status: "fail",
      message: "Authentication required",
    });

    return;
  }

  const { status } = req.body;

  const shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    res.status(404).json({
      status: "fail",
      message: "Shipment not found",
    });

    return;
  }

  const deliveryAgent = await DeliveryAgent.findOne({
    user: req.userId,
  });

  if (!deliveryAgent) {
    res.status(404).json({
      status: "fail",
      message: "Delivery agent profile not found",
    });

    return;
  }

  if (
    !shipment.assignedAgent ||
    shipment.assignedAgent.toString() !== deliveryAgent._id.toString()
  ) {
    res.status(403).json({
      status: "fail",
      message: "You are not assigned to this shipment",
    });

    return;
  }

  const agentStatuses: ShipmentStatus[] = [
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "DELIVERY_FAILED",
  ];

  if (!agentStatuses.includes(status)) {
    res.status(400).json({
      status: "fail",
      message: "Invalid status for delivery agent",
    });

    return;
  }

  const validTransition = isValidStatusTransition(shipment.status, status);

  if (!validTransition) {
    res.status(400).json({
      status: "fail",
      message: `Cannot change shipment status from ${shipment.status} to ${status}`,
    });

    return;
  }

  shipment.status = status;

  shipment.statusHistory.push({
    status,
    changedAt: new Date(),
  });

  if (status === "DELIVERED" || status === "DELIVERY_FAILED") {
    deliveryAgent.availability = "AVAILABLE";
  }

  await shipment.save();
  await deliveryAgent.save();

  res.status(200).json({
    status: "success",
    message: "Shipment status updated successfully",
    data: {
      shipment,
    },
  });
};
