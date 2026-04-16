import Product from '../models/products.js';
import Customer from '../models/customer.js';
import SalesOrder from '../models/salesOrder.js';

/** GET /api/dashboard */
export const getDashboardStats = async (req, res) => {
  try {
    const [totalProducts, totalCustomers, totalOrders, revenueAgg] = await Promise.all([
      Product.countDocuments(),
      Customer.countDocuments(),
      SalesOrder.countDocuments(),
      SalesOrder.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue ?? 0;

    res.status(200).json({
      totalProducts,
      totalCustomers,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

/** GET /api/dashboard/sales */
export const getDashboardSales = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const raw = await SalesOrder.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = [];
    const sales = [];
    for (let m = 1; m <= 6; m++) {
      months.push(monthNames[m - 1]);
      const row = raw.find((r) => r._id === m);
      sales.push(row ? Math.round(row.total) : 0);
    }

    res.status(200).json({ months, sales });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales data', error: error.message });
  }
};

/** GET /api/products/top-selling */
export const getTopSellingProducts = async (req, res) => {
  try {
    const pipeline = [
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          sold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$product.name', 'Unknown'] },
          sold: 1,
        },
      },
    ];

    let rows = await SalesOrder.aggregate(pipeline);

    if (!rows.length) {
      const fallback = await Product.find().sort({ stock: 1 }).limit(5).select('name stock').lean();
      rows = fallback.map((p) => ({ name: p.name, sold: 0 }));
    }

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top selling products', error: error.message });
  }
};

/** GET /api/products/low-stock */
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ stock: { $lt: 20 } })
      .select('name stock')
      .sort({ stock: 1 })
      .lean();

    const payload = products.map((p) => ({
      name: p.name,
      stockQuantity: p.stock,
      stock: p.stock,
    }));

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching low stock products', error: error.message });
  }
};

function mapOrderStatusForClient(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'delivered') return 'completed';
  if (s === 'cancelled') return 'cancelled';
  return 'pending';
}

/** GET /api/salesorders/recent */
export const getRecentSalesOrders = async (req, res) => {
  try {
    const orders = await SalesOrder.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name email')
      .lean();

    const payload = orders.map((o) => {
      const idStr = o._id ? o._id.toString() : '';
      const orderId = idStr.length >= 6 ? `SO-${idStr.slice(-6).toUpperCase()}` : idStr;

      return {
        _id: o._id,
        orderId,
        customerName: o.customer?.name || '—',
        date: o.createdAt,
        createdAt: o.createdAt,
        totalAmount: o.totalAmount,
        status: mapOrderStatusForClient(o.status),
      };
    });

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent orders', error: error.message });
  }
};
