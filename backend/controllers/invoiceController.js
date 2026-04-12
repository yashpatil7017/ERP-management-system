import e from "express";
import Invoice from "../models/invoice.js";
import SalesOrder from "../models/salesOrder.js";
import mongoose from "mongoose";

// Create a new invoice based on a sales order
const createInvoice = async (req, res) => {

try {

const { salesOrderId } = req.body;

const salesOrder = await SalesOrder
.findById(salesOrderId)
.populate("items.product")
.populate("customer");

if (!salesOrder) {
return res.status(404).json({ message: "Sales order not found" });
}

// Prevent duplicate invoices
const existingInvoice = await Invoice.findOne({ salesOrder: salesOrderId });

if (existingInvoice) {
return res.status(400).json({ message: "Invoice already exists for this order" });
}

// Allow invoice only after delivery
if (salesOrder.status !== "delivered") {
return res.status(400).json({
message: "Invoice can only be created after order is delivered"
});
}

// Generate invoice number
const count = await Invoice.countDocuments();
const invoiceNumber = `INV-${(count + 1).toString().padStart(5, "0")}`;

const items = salesOrder.items.map(item => ({
product: item.product._id,
quantity: item.quantity,
price: item.price
}));

const total = items.reduce(
(sum, item) => sum + item.quantity * item.price,
0
);

const invoice = new Invoice({

invoiceNumber,
salesOrder: salesOrder._id,
customer: salesOrder.customer._id,
items,
totalAmount: total

});

const savedInvoice = await invoice.save();

res.status(201).json("Invoice Created Successfully", { invoice: savedInvoice });

} catch (error) {

res.status(500).json({ message: error.message });

}

};

//Get all invoices with pagination and search

const getInvoices = async (req, res) => {

try {

const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10;

const search = req.query.search || "";
const status = req.query.status;
const startDate = req.query.startDate;
const endDate = req.query.endDate;

const sortBy = req.query.sortBy || "createdAt";
const order = req.query.order === "asc" ? 1 : -1;

let query = {};


// FILTER BY STATUS
if (status) {
query.status = status;
}


// FILTER BY DATE RANGE
if (startDate || endDate) {

query.invoiceDate = {};

if (startDate) {
query.invoiceDate.$gte = new Date(startDate);
}

if (endDate) {
query.invoiceDate.$lte = new Date(endDate);
}

}


// SEARCH LOGIC
if (search) {

if (search.match(/^[0-9a-fA-F]{24}$/)) {

query.salesOrder = search;

} else {

const customers = await Customer.find({
name: { $regex: search, $options: "i" }
}).select("_id");

const customerIds = customers.map(c => c._id);

query.$or = [
{ invoiceNumber: { $regex: search, $options: "i" } },
{ customer: { $in: customerIds } }
];

}

}


// EXECUTE QUERY
const invoices = await Invoice.find(query)

.populate("customer", "name email city")

.populate("salesOrder")

.populate("items.product", "name price")

.sort({ [sortBy]: order })

.skip((page - 1) * limit)

.limit(limit);



const total = await Invoice.countDocuments(query);


// RESPONSE
res.json({

total,

page,

totalPages: Math.ceil(total / limit),

invoices

});

} catch (error) {

res.status(500).json({ message: error.message });

}

};

export { createInvoice, getInvoices };