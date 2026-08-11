"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.list = list;
exports.getById = getById;
exports.update = update;
exports.followUp = followUp;
exports.remove = remove;
const customer_validator_1 = require("../validators/customer.validator");
const customer_service_1 = require("../services/customer.service");
async function create(req, res) {
    try {
        const validation = customer_validator_1.createCustomerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: "Validation failed", errors: validation.error.flatten() });
        }
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        // businessId comes from the authenticated user — NOT from the request body
        const customer = await (0, customer_service_1.createCustomer)(validation.data, req.user.userId, req.user.businessId);
        return res.status(201).json({ success: true, message: "Customer created successfully", data: customer });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to create customer" });
    }
}
async function list(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await (0, customer_service_1.getCustomers)({
            businessId: req.user.businessId,
            search: req.query.search,
            status: req.query.status,
            customerType: req.query.customerType,
            page,
            limit,
        });
        return res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch customers" });
    }
}
async function getById(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const customer = await (0, customer_service_1.getCustomerById)(req.params.id, req.user.businessId);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }
        return res.status(200).json({ success: true, data: customer });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to fetch customer" });
    }
}
async function update(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const validation = customer_validator_1.updateCustomerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, message: "Validation failed", errors: validation.error.flatten() });
        }
        const customer = await (0, customer_service_1.updateCustomer)(req.params.id, req.user.businessId, validation.data);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }
        return res.status(200).json({ success: true, message: "Customer updated successfully", data: customer });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to update customer" });
    }
}
async function followUp(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const { notes, followUpDate } = req.body;
        if (!notes) {
            return res.status(400).json({ success: false, message: "Follow-up notes are required" });
        }
        const customer = await (0, customer_service_1.addFollowUp)(req.params.id, req.user.businessId, notes, followUpDate);
        if (!customer) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }
        return res.status(200).json({ success: true, message: "Follow-up added successfully", data: customer });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to add follow-up" });
    }
}
async function remove(req, res) {
    try {
        if (!req.user?.businessId) {
            return res.status(403).json({ success: false, message: "Business context required" });
        }
        const deleted = await (0, customer_service_1.deleteCustomer)(req.params.id, req.user.businessId);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }
        return res.status(200).json({ success: true, message: "Customer deleted successfully" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to delete customer" });
    }
}
//# sourceMappingURL=customer.controller.js.map