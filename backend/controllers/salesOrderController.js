import mongoose from "mongoose";
import SalesOrder from "../models/salesOrder.js";
import Customer from "../models/customer.js";
import Product from "../models/products.js";

//Create Sales Order
const createSalesOrder = async (req, res) => {
    
        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

    try {    
        const { customer, items } = req.body;
        let totalAmount = 0;

        for (let item of items) {
            const product = await Product.findById(item.product).session(session);
            if (!product) {
                throw new Error(`Product not found ${item.product}`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}`);
            }

            item.price = product.price;
            totalAmount += product.price * item.quantity;

            product.stock -= item.quantity;
            await product.save({ session });
        }

        const salesOrder = new SalesOrder({
            customer,
            items,
            totalAmount,
        });

        const savedOrder = await salesOrder.save({ session });

        await session.commitTransaction();
        session.endSession();
        
        res.status(201).json({ message: "Sales order created successfully", salesOrder: savedOrder });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Error creating sales order", error });
    }
};

//Update Sales Order

const updateSalesOrder = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const orderId = req.params.id;
        const {customer, items } = req.body;

        //Get existing order
        const existingOrder = await SalesOrder.findById(orderId).session(session);
        if (!existingOrder) {
            throw new Error("Sales order not found");
        }

        if (["shipped", "delivered", "cancelled"].includes(existingOrder.status)) {
  	        throw new Error(`Cannot update an order that is already ${existingOrder.status}`);
	    }

        // Restore stock for existing items
        for (let item of existingOrder.items) {
            const product = await Product.findById(item.product).session(session);
            if (product) {
                product.stock += item.quantity;
                await product.save({ session });
            }
        }

        //Apply new stock deduction and calculate total amount
        let totalAmount = 0;
        for (let item of items) {
            const product = await Product.findById(item.product).session(session);
            if (!product) {
                throw new Error(`Product not found ${item.product}`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product ${product.name}`);
            }
            item.price = product.price;
            totalAmount += product.price * item.quantity;
            product.stock -= item.quantity;
            await product.save({ session });
        }

        // Update order details
        existingOrder.customer = customer;
        existingOrder.items = items;
        existingOrder.totalAmount = totalAmount;

        const updatedOrder = await existingOrder.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Sales order updated successfully", salesOrder: updatedOrder });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: "Error updating sales order", error });
    }
};

// Get Sales Order

const getSalesOrder = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const status = req.query.status;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const search = req.query.search;
        const sortBy = req.query.sortBy || "createdAt";
        const order = req.query.order === "desc" ? -1 : 1;

        let query = {};

        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        //Search Logic
        if (search) {
            
            //Search by Order ID

            if (search.match(/^[0-9a-fA-F]{24}$/)) {
                query._id = search;
            }

            //Search by Customer Name or Email
            const customers = await Customer.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
            }).select("_id");

            const customerIds = customers.map((customer) => customer._id);

            if (customerIds.length > 0) {
                query.customer = { $in: customerIds };
            }
        }

        const salesOrders = await SalesOrder.find(query)
            .populate("customer", "name city email")
            .populate("items.product", "name price")
            .sort({ [sortBy]: order })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalOrders = await SalesOrder.countDocuments(query);

        res.status(200).json({
            totalOrders,
            page,
            totalPages: Math.ceil(totalOrders / limit),
            salesOrders,
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching sales order", error });
    }
};

// Order Status Update (e.g., shipped, delivered, cancelled) can be implemented similarly with appropriate stock adjustments and validations.

const updateOrderStatus = async (req, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const {status} = req.body;

        const order = await SalesOrder.findById(req.params.id).session(session);

        if (!order) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Sales order not found" });
        }

        const allowedTransitions = {
            pending: ["shipped", "cancelled"],
            shipped: ["delivered", "cancelled"],
            delivered: [],
            cancelled: [],
        };

        if (!allowedTransitions[order.status].includes(status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: `Invalid status transition from ${order.status} to ${status}` });
        }

        if (status === "cancelled") {
            for (let item of order.items) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { new: true, session });
            }
        }

        // Order TimeLine Logic: We can also add a timeline entry here for status change if we have a timeline collection/model
        // if (status === "shipped") order.shippedAt = new Date();
        // if (status === "delivered") order.deliveredAt = new Date();
        // if (status === "cancelled") order.cancelledAt = new Date();

        order.status = status;

        await order.save({ session });
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: "Order status updated successfully", order });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Detailed Error :", error);
        res.status(500).json({ message: "Error updating order status", error : error.message });
    }
};

export { createSalesOrder, updateSalesOrder, getSalesOrder, updateOrderStatus };