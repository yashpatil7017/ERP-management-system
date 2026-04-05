import Customer from '../models/customer.js';

// Add Customer
const addCustomer = async (req, res) => {
    try {
        const newCustomer = new Customer(req.body);
        await newCustomer.save();
        res.status(201).json({ message: 'Customer added successfully', customer: newCustomer });
    } catch (error) {
        res.status(500).json({ message: 'Error adding Customer' });
    }
};


// Upadate Customer
const updateCustomer = async (req, res) => {
    try {
        const customer =  await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true , runValidators: true });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer updated successfully', customer });
    } catch (error) {
        res.status(500).json({ message: 'Error updating Customer' });
    }
};

// Delete Customer
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({ message: 'Customer deleted successfully', customer });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting Customer' });
    }
};

// Search and Pagination for Customers
const getCustomers = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const order = req.query.order === 'desc' ? -1 : 1;

        let query = {};

        if (search) {
            query = { $text: { $search: search } };
        }

        const customers = await Customer.find(query)
            .sort({ [sortBy]: order })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Customer.countDocuments(query);

        res.status(200).json({
            total,
            page,
            limit,
            customers,
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching Customers' });
    }
};

export { addCustomer, updateCustomer, deleteCustomer, getCustomers };