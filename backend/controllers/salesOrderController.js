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

export { createSalesOrder };