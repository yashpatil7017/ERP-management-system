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
export { addCustomer, updateCustomer };