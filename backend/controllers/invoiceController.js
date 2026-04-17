import Invoice from "../models/invoice.js";
import SalesOrder from "../models/salesOrder.js";

function toCurrencyNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function generateInvoiceNumber() {
  const latest = await Invoice.findOne().sort({ createdAt: -1 }).select("invoiceNumber");
  const match = latest?.invoiceNumber?.match(/INV-(\d+)/i);
  const next = match ? Number(match[1]) + 1 : 1;
  return `INV-${String(next).padStart(5, "0")}`;
}

function buildInvoiceFromSalesOrder(salesOrder) {
  const products = (salesOrder.items || []).map((item) => {
    const quantity = toCurrencyNumber(item.quantity, 0);
    const price = toCurrencyNumber(item.price, toCurrencyNumber(item.product?.price, 0));
    return {
      productId: item.product?._id || item.product,
      productName: item.product?.name || "Unknown Product",
      quantity,
      price,
      total: quantity * price,
    };
  });

  const subtotal = products.reduce((sum, p) => sum + p.total, 0);
  const tax = subtotal * 0.18;
  const discount = 0;
  const total = subtotal + tax - discount;

  return {
    products,
    subtotal,
    tax,
    discount,
    total,
    customerName: salesOrder.customer?.name || "Unknown Customer",
    customerEmail: salesOrder.customer?.email || "",
    customerPhone: salesOrder.customer?.phone || "",
    billingAddress: salesOrder.customer?.city || "",
  };
}

// POST /api/invoices
const createInvoice = async (req, res) => {
  try {
    const { salesOrderId, status, discount } = req.body;
    if (!salesOrderId) {
      return res.status(400).json({ message: "salesOrderId is required" });
    }

    const existingInvoice = await Invoice.findOne({ salesOrderId });
    if (existingInvoice) {
      return res.status(400).json({ message: "Invoice already exists for this sales order" });
    }

    const salesOrder = await SalesOrder.findById(salesOrderId)
      .populate("customer", "name email phone city")
      .populate("items.product", "name price");

    if (!salesOrder) {
      return res.status(404).json({ message: "Sales order not found" });
    }

    const computed = buildInvoiceFromSalesOrder(salesOrder);
    const safeDiscount = Math.max(0, toCurrencyNumber(discount, computed.discount));
    const total = Math.max(0, computed.subtotal + computed.tax - safeDiscount);

    const invoice = await Invoice.create({
      invoiceNumber: await generateInvoiceNumber(),
      salesOrderId: salesOrder._id,
      customerName: computed.customerName,
      customerEmail: computed.customerEmail,
      customerPhone: computed.customerPhone,
      billingAddress: computed.billingAddress,
      products: computed.products,
      subtotal: computed.subtotal,
      tax: computed.tax,
      discount: safeDiscount,
      total,
      status: String(status || "unpaid").toLowerCase(),
      invoiceDate: new Date(),
    });

    return res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const search = String(req.query.search || "").trim();
    const status = String(req.query.status || "").trim().toLowerCase();
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const query = {};
    if (status && status !== "all") query.status = status;

    if (req.query.startDate || req.query.endDate) {
      query.invoiceDate = {};
      if (req.query.startDate) query.invoiceDate.$gte = new Date(req.query.startDate);
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        end.setHours(23, 59, 59, 999);
        query.invoiceDate.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
      ];

      if (/^[0-9a-fA-F]{24}$/.test(search)) {
        query.$or.push({ salesOrderId: search });
      }
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort({ [sortBy]: order })
        .skip((page - 1) * limit)
        .limit(limit),
      Invoice.countDocuments(query),
    ]);

    return res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      invoices,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    return res.status(200).json({ invoice });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/invoices/:id
const deleteInvoice = async (req, res) => {
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Invoice not found" });
    return res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/invoices/updateInvoiceStatus/:id (legacy support)
const updateInvoiceStatus = async (req, res) => {
  try {
    const status = String(req.body.status || "paid").toLowerCase();
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    invoice.status = status;
    const updated = await invoice.save();
    return res.status(200).json({ message: "Invoice status updated successfully", invoice: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getRevenueReport = async (_req, res) => {
  try {
    const totalRevenueResult = await Invoice.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
    return res.status(200).json({ totalRevenue, monthlyRevenue: [], topCustomers: [] });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { createInvoice, getInvoices, getInvoiceById, deleteInvoice, updateInvoiceStatus, getRevenueReport };