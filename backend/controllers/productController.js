import Product from "../models/products.js"; 

// Add a new product
const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error });
  }
};

//Delete a product

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error });
    }
};

// Get Products with pagination and search
const getProducts = async (req, res) => {
    try {
    
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";

      const query = {
        name: { $regex: search, $options: "i" },      
      };

      const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Product.countDocuments(query);

      res.status(200).json({
        total,
        page,
        limit,
        products,
      });
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error });
    }
};

export { createProduct, deleteProduct, updateProduct, getProducts};