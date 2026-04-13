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

//Get invoice by ID

const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await Invoice.findById(id)
            .populate("customer", "name email phone city")
            .populate("salesOrder")
            .populate("items.product", "name price");

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.status(200).json({ message: "Invoice retrieved successfully", invoice });
        console.log("Invoice retrieved successfully", invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Update invoice status to Paid

const updateInvoiceStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await Invoice.findById(id);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        if (invoice.status === "Paid") {
            return res.status(400).json({ message: "Invoice is already marked as Paid" });
        }

        invoice.status = "Paid";
        invoice.paidAt = new Date();

        const updatedInvoice = await invoice.save();

        res.status(200).json({ message: "Invoice status updated successfully", invoice: updatedInvoice });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Revenue Analysis total revenue , monthly revenue , top customers

const getRevenueReport = async (req, res) => {

  try {

    // 1️⃣ TOTAL REVENUE (Only Paid Invoices)
    const totalRevenueResult = await Invoice.aggregate([
      { $match: { status: "Paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" }
        }
      }
    ]);

    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

    // 2️⃣ MONTHLY REVENUE
    const monthlyRevenue = await Invoice.aggregate([
      { $match: { status: "Paid" } },
      {
        $group: {
          _id: {
            year: { $year: "$invoiceDate" },
            month: { $month: "$invoiceDate" }
          },
          revenue: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1
        }
      }
    ]);

    // 3️⃣ TOP CUSTOMERS
    const topCustomers = await Invoice.aggregate([
      { $match: { status: "Paid" } },
      {
        $group: {
          _id: "$customer",
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customer"
        }
      },
      { $unwind: "$customer" },
      {
        $project: {
          _id: 0,
          customerId: "$customer._id",
          name: "$customer.name",
          email: "$customer.email",
          revenue: 1,
          orders: 1
        }
      }
    ]);

    // RESPONSE
    res.json({
      totalRevenue,
      monthlyRevenue,
      topCustomers
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

export { createInvoice, getInvoices, getInvoiceById, updateInvoiceStatus, getRevenueReport };