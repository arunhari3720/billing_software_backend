import ProductOption from "../models/productoption.model.js";
import { Product } from "../models/Product.model.js";

const normalizeValue = (value) =>
  value.trim().replace(/\s+/g, " ");

export const listProductOptions = async (req, res) => {
  try {
    const agencyId = req.agencyId;
    const type = String(req.query.type || "").toUpperCase();

    if (!agencyId) {
      return res.status(400).json({
        success: false,
        message: "Agency information missing. Please login again.",
      });
    }

    if (!["BRAND", "CATEGORY"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be BRAND or CATEGORY",
      });
    }

    const field = type === "BRAND" ? "brand" : "category";

    const [savedOptions, productValues] = await Promise.all([
      ProductOption.find({
        agency: agencyId,
        type,
        active: true,
      })
        .select("value")
        .lean(),

      Product.distinct(field, {
        agency: agencyId,
        active: true,
      }),
    ]);

    // Merge saved options and values from existing products.
    // Deduplicate case-insensitively.
    const uniqueValues = new Map();

    for (const item of savedOptions) {
      const value = normalizeValue(item.value || "");

      if (value) {
        uniqueValues.set(value.toLowerCase(), value);
      }
    }

    for (const item of productValues) {
      const value =
        typeof item === "string" ? normalizeValue(item) : "";

      if (value) {
        uniqueValues.set(
          value.toLowerCase(),
          uniqueValues.get(value.toLowerCase()) || value
        );
      }
    }

    const data = [...uniqueValues.values()].sort((a, b) =>
      a.localeCompare(b)
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("listProductOptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product options",
    });
  }
};

export const createProductOption = async (req, res) => {
  try {
    const agencyId = req.agencyId;

    if (!agencyId) {
      return res.status(400).json({
        success: false,
        message: "Agency information missing. Please login again.",
      });
    }

    const type = String(req.body.type || "").toUpperCase();
    const rawValue = req.body.value;

    if (!["BRAND", "CATEGORY"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be BRAND or CATEGORY",
      });
    }

    if (typeof rawValue !== "string") {
      return res.status(400).json({
        success: false,
        message: "Option value is required",
      });
    }

    const value = normalizeValue(rawValue);

    if (!value) {
      return res.status(400).json({
        success: false,
        message: "Option value cannot be empty",
      });
    }

    if (value.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Option value cannot exceed 100 characters",
      });
    }

    const normalizedValue = value.toLowerCase();

    // Reuse an existing active or inactive option.
    const option = await ProductOption.findOneAndUpdate(
      {
        agency: agencyId,
        type,
        normalizedValue,
      },
      {
        $set: {
          value,
          active: true,
        },
        $setOnInsert: {
          agency: agencyId,
          type,
          normalizedValue,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: `${type === "BRAND" ? "Brand" : "Category"} saved successfully`,
      data: option,
    });
  } catch (error) {
    // Protect against concurrent requests creating the same option.
    if (error.code === 11000) {
      try {
        const type = String(req.body.type || "").toUpperCase();
        const value =
          typeof req.body.value === "string"
            ? normalizeValue(req.body.value)
            : "";

        const option = await ProductOption.findOne({
          agency: req.agencyId,
          type,
          normalizedValue: value.toLowerCase(),
        });

        if (option) {
          return res.status(200).json({
            success: true,
            message: "Option already exists",
            data: option,
          });
        }
      } catch (lookupError) {
        console.error("Duplicate option lookup error:", lookupError);
      }
    }

    console.error("createProductOption error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save product option",
    });
  }
};