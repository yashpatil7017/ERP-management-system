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

export { createSalesOrder, updateSalesOrder };