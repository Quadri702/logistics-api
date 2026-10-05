import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import Shipment from "../models/shipment.model.js";
import Payment from "../models/payment.model.js";

export const getShipmentAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const [analytics] = await Shipment.aggregate([
    {
      $facet: {
        totalShipments: [
          {
            $count: "count",
          },
        ],

        shipmentsByStatus: [
          {
            $group: {
              _id: "$status",
              count: {
                $sum: 1,
              },
            },
          },
          {
            $sort: {
              count: -1,
            },
          },
        ],
      },
    },
  ]);

  const totalShipments = analytics.totalShipments[0]?.count ?? 0;

  res.status(200).json({
    status: "success",
    data: {
      totalShipments,
      shipmentsByStatus: analytics.shipmentsByStatus,
    },
  });
};

export const getPaymentAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const [analytics] = await Payment.aggregate([
    {
      $match: {
        status: "SUCCESS",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$amount",
        },
        successfulPayments: {
          $sum: 1,
        },
      },
    },
  ]);

  const totalRevenue = analytics?.totalRevenue ?? 0;
  const successfulPayments = analytics?.successfulPayments ?? 0;

  res.status(200).json({
    status: "success",
    data: {
      totalRevenue,
      successfulPayments,
    },
  });
};

export const getDeliveryAgentAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const agentPerformance = await Shipment.aggregate([
    {
      $match: {
        assignedAgent: {
          $ne: null,
        },
      },
    },

    {
      $group: {
        _id: "$assignedAgent",

        totalShipments: {
          $sum: 1,
        },

        deliveredShipments: {
          $sum: {
            $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0],
          },
        },
      },
    },

    {
      $lookup: {
        from: "deliveryagents",
        localField: "_id",
        foreignField: "_id",
        as: "deliveryAgent",
      },
    },

    {
      $unwind: "$deliveryAgent",
    },

    {
      $lookup: {
        from: "users",
        localField: "deliveryAgent.user",
        foreignField: "_id",
        as: "user",
      },
    },

    {
      $unwind: "$user",
    },

    {
      $project: {
        _id: 0,

        agentId: "$deliveryAgent._id",
        agentName: "$user.name",
        agentEmail: "$user.email",

        totalShipments: 1,
        deliveredShipments: 1,
      },
    },

    {
      $sort: {
        deliveredShipments: -1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      agentPerformance,
    },
  });
};
