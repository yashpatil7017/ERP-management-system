import express from 'express';
import Customer from '../models/customer.js';
import e from 'express';

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

export { addCustomer };