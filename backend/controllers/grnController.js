import mongoose from "mongoose";
import GRN from "../models/GRN.js";
import PurchaseOrder from "../models/purchaseOrder.js";
import Product from "../models/products.js";

//Create a new GRN
const createGRN = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { purchaseOrderId, items, receivedBy, remarks , damageQty} = req.body;

    const purchaseOrder = await PurchaseOrder
      .findById(purchaseOrderId)
      .session(session);

    if (!purchaseOrder) {
      throw new Error("Purchase Order not found");
    }

    if (purchaseOrder.status === "cancelled") {
      throw new Error("Cannot receive cancelled order");
    }

    let grnItems = [];

    for (const item of items) {

      const product = await Product
        .findById(item.product)
        .session(session);

      if (!product) {
        throw new Error("Product not found");
      }

      const receivedQty = item.receivedQty - (item.damageQty || 0);

      product.stock += receivedQty;

      await product.save({ session });


      grnItems.push({
        product: item.product,
        orderedQty: item.orderedQty,
        receivedQty: item.receivedQty,
        damageQty: item.damageQty || 0
      });
    }

    const grn = new GRN({
      purchaseOrder: purchaseOrderId,
      supplier: purchaseOrder.supplier,
      items: grnItems,
      receivedBy,
      remarks
    });

    const savedGRN = await grn.save({ session });

    purchaseOrder.status = "received";

    await purchaseOrder.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(savedGRN);

  } catch (error) {

    await session.abortTransaction();
    session.endSession();

    res.status(400).json({ message: error.message });
  }
};

//Get GRN (ReceivedBy , supplier , purchaseOrder)

const getGRNs = async (req, res) => {
  try {

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    let matchStage = {};

    if (search) {
      matchStage = {
        $or: [
          { receivedBy: { $regex: search, $options: "i" } },
          { "supplier.name": { $regex: search, $options: "i" } },
          { "purchaseOrder._id": search }
        ]
      };
    }

    const pipeline = [

      // join purchase order
      {
        $lookup: {
          from: "purchaseorders",
          localField: "purchaseOrder",
          foreignField: "_id",
          as: "purchaseOrder"
        }
      },
      { $unwind: "$purchaseOrder" },

      // join supplier
      {
        $lookup: {
          from: "suppliers",
          localField: "supplier",
          foreignField: "_id",
          as: "supplier"
        }
      },
      { $unwind: "$supplier" },

      // join products
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "products"
        }
      },

      // search
      { $match: matchStage },

      // sorting
      { $sort: { createdAt: -1 } },

      // pagination
      { $skip: skip },
      { $limit: limit }
    ];

    const grns = await GRN.aggregate(pipeline);

    const total = await GRN.countDocuments();

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      grns
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createGRN, getGRNs };