import Pizza from "../models/Pizza.js";

export const getAllPizzas = async (req, res) => {
  try {
    const pizzas = await Pizza.find({ isAvailable: true });

    return res.status(200).json({
      success: true,
      count: pizzas.length,
      pizzas,
    });
  } catch (error) {
    console.error("Get pizzas error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pizzas",
    });
  }
};

import mongoose from "mongoose";

export const getPizzaById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID",
      });
    }

    const pizza = await Pizza.findById(id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    return res.status(200).json({
      success: true,
      pizza,
    });
  } catch (error) {
    console.error("Get pizza error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch pizza",
    });
  }
};

export const createPizza = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      sizes,
      ingredients,
      image,
      isAvailable,
      isFeatured,
    } = req.body;

    // Check required fields
    if (!name || !description || !category || !sizes?.length) {
      return res.status(400).json({
        success: false,
        message: "Name, description, category, and sizes are required",
      });
    }

    // Create pizza in database
    const pizza = await Pizza.create({
      name,
      description,
      category,
      sizes,
      ingredients,
      image,
      isAvailable,
      isFeatured,
    });

    return res.status(201).json({
      success: true,
      message: "Pizza created successfully",
      pizza,
    });
  } catch (error) {
    console.error("Create pizza error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create pizza",
    });
  }
};


export const updatePizza = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID",
      });
    }

    // Only allow these fields to be updated
    const allowedFields = [
      "name",
      "description",
      "category",
      "sizes",
      "ingredients",
      "image",
      "isAvailable",
      "isFeatured",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const pizza = await Pizza.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pizza updated successfully",
      pizza,
    });
  } catch (error) {
    console.error("Update pizza error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update pizza",
    });
  }
};


export const deletePizza = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pizza ID",
      });
    }

    const pizza = await Pizza.findByIdAndDelete(id);

    if (!pizza) {
      return res.status(404).json({
        success: false,
        message: "Pizza not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pizza deleted successfully",
      pizza,
    });
  } catch (error) {
    console.error("Delete pizza error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete pizza",
    });
  }
};
