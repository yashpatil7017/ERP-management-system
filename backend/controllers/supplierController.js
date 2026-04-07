import Supplier from "../models/suppliers.js";

// Add Supplier
const addSupplier = async (req, res) => {
    try {
        const newSupplier = new Supplier(req.body);
        await newSupplier.save();
        res.status(201).json({ message: "Supplier added successfully", supplier: newSupplier });
    } catch (error) {
        res.status(500).json({ message: "Error adding supplier", error });
    }
};

// Update Supplier
const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        res.status(200).json({ message: "Supplier updated successfully", supplier });
    } catch (error) {
        res.status(500).json({ message: "Error updating supplier", error });
    }
};

// Delete Supplier
const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        res.status(200).json({ message: "Supplier deleted successfully", supplier });
    } catch (error) {
        res.status(500).json({ message: "Error deleting supplier", error });
    }
};

// Get Suppliers with pagination and search
const getSuppliers = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || "";
        const sortBy = req.query.sortBy || "createdAt";
        const order = req.query.order === "desc" ? -1 : 1;

        let query = {};
        if (search) {
            query = { $text: { $search: search } };
        }

        const suppliers = await Supplier.find(query)
            .sort({ [sortBy]: order })
            .skip((page - 1) * limit)
            .limit(limit);
        
        const total = await Supplier.countDocuments(query);

        res.status(200).json({
            total,
            page,
            limit,
            suppliers,
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching suppliers", error });
    }
};

export { addSupplier, updateSupplier, deleteSupplier, getSuppliers };