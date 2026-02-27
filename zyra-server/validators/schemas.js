const Joi = require("joi");

exports.registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid("admin", "manager", "operator", "viewer"),
    department: Joi.string().max(100),
  }),
};

exports.loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

exports.inventoryCreateSchema = {
  body: Joi.object({
    product: Joi.string().required(),
    sku: Joi.string().required(),
    warehouse: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
    reorderPoint: Joi.number().min(0),
    reorderQuantity: Joi.number().min(1),
    location: Joi.string(),
  }),
};

exports.optimizationRunSchema = {
  body: Joi.object({
    type: Joi.string()
      .valid("production-scheduling", "inventory-reorder", "resource-allocation", "cost-minimization")
      .required(),
    constraints: Joi.object().required(),
    objective: Joi.string().required(),
  }),
};

exports.simulationRunSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string(),
    type: Joi.string().valid("what-if", "monte-carlo", "sensitivity-analysis", "stress-test").required(),
    mutations: Joi.array()
      .items(
        Joi.object({
          parameter: Joi.string().required(),
          change: Joi.string().required(),
          description: Joi.string(),
        })
      )
      .min(1)
      .required(),
    iterations: Joi.number().min(1).max(10000),
  }),
};

exports.aiExplainSchema = {
  body: Joi.object({
    contextType: Joi.string()
      .valid("optimization", "simulation", "forecast", "defect", "inventory", "general")
      .required(),
    contextId: Joi.string(),
    question: Joi.string().min(5).max(500).required(),
    dataContext: Joi.object(),
  }),
};
