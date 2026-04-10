import purchaseOrder from "../models/purchaseOrder.js";
import Product from "../models/products.js";
import Supplier from "../models/suppliers.js";
import mongoose from "mongoose";

// Create a new purchase order
const createPurchaseOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { supplier, items } = req.body;
    let totalAmount = 0;

    for (let item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }

      // Pro-Tip: Use costPrice if you have it, otherwise use price
      item.price = product.price; 
      totalAmount += item.price * item.quantity;
    }

    const order = new purchaseOrder({
      supplier,
      items,
      totalAmount,
      status: "ordered"
    });

    const savedOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Purchase order created successfully", purchaseOrder: savedOrder });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: "Error creating purchase order", error: error.message });
  }
};

//Get all purchase orders
const getPurchaseOrders = async (req, res) => {
  try {
    // 1️⃣ Pagination
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);

    // 2️⃣ Query parameters
    const {
      status,
      supplier,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      order = "desc"
    } = req.query;

    let query = {};

    // 3️⃣ Filter by Status
    if (status) {
      query.status = status;
    }

    // 4️⃣ Filter by Supplier ID
    if (supplier) {
      query.supplier = supplier;
    }

    // 5️⃣ Date Range Filter
    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // 6️⃣ Search Logic
    if (search) {

      // Search by Order ID
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = search;
      } else {

        // Search Supplier Name
        const matchingSuppliers = await Supplier.find({
          name: { $regex: search, $options: "i" }
        }).select("_id");

        const supplierIds = matchingSuppliers.map(s => s._id);

        // Search Product Name
        const matchingProducts = await Product.find({
          name: { $regex: search, $options: "i" }
        }).select("_id");

        const productIds = matchingProducts.map(p => p._id);

        query.$or = [
          { supplier: { $in: supplierIds } },
          { "items.product": { $in: productIds } }
        ];
      }
    }

    // 7️⃣ Sorting
    const sortOrder = order === "asc" ? 1 : -1;

    // 8️⃣ Execute Queries in Parallel
    const [orders, totalOrders] = await Promise.all([
      purchaseOrder.find(query)
        .populate("supplier", "name email city")
        .populate("items.product", "name sku price")
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      purchaseOrder.countDocuments(query)
    ]);

    // 9️⃣ Response
    res.status(200).json({
      message: "Purchase orders retrieved successfully",
      totalOrders,
      page,
      totalPages: Math.ceil(totalOrders / limit),
      orders
    });

  } catch (error) {
    console.error("GET_PURCHASE_ORDERS_ERROR:", error);

    res.status(500).json({
      message: "Error fetching purchase orders",
      error: error.message
    });
  }
};

// Update purchase order status (e.g., mark as received)

const updatePurchaseOrderStatus = async (req, res) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const { status } = req.body;

    const order = await purchaseOrder.findById(req.params.id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Purchase order not found" });
    }

    const allowedTransitions = {
      ordered: ["received", "cancelled"],
      received: [],
      cancelled: []
    };

    if (!allowedTransitions[order.status].includes(status)) {

      await session.abortTransaction();

      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    // 🟢 When goods are received → increase stock
    if (status === "received") {

      for (const item of order.items) {

        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { session }
        );

      }

      // order.receivedAt = new Date();
    }

    order.status = status;

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: `Purchase order status updated to ${status}`,
      order
    });

  } catch (error) {

    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ message: "Error updating purchase order status" , error: error.message });
  }
};

export { createPurchaseOrder, getPurchaseOrders, updatePurchaseOrderStatus };