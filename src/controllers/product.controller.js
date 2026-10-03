import { Product } from "../models/Product.model.js";


// =========================================
// PRICE CALCULATION
// =========================================

function calculateProductPrices(data) {
  const rawPrice = Number(
    data.rawPrice || 0,
  );

  const gstRate = Number(
    data.gstRate || 0,
  );

  const marginPercentage = Number(
    data.marginPercentage || 0,
  );

  // =========================================
  // RAW GST
  // =========================================

  const rawGstAmount =
    (rawPrice * gstRate) / 100;

  // =========================================
  // RAW TOTAL
  // =========================================

  const rawTotalPrice =
    rawPrice + rawGstAmount;

  // =========================================
  // MARGIN
  // =========================================
  //
  // Margin is calculated on raw total
  // including raw GST.
  //

  const marginPrice =
    (rawTotalPrice * marginPercentage) /
    100;

  // =========================================
  // MARGIN GST
  // =========================================

  const marginGst =
    (marginPrice * gstRate) / 100;

  // =========================================
  // FINAL RETAIL PRICE
  // =========================================

  const retailPrice =
    rawTotalPrice +
    marginPrice +
    marginGst;

  return {
    rawGstAmount: Number(
      rawGstAmount.toFixed(2),
    ),

    rawTotalPrice: Number(
      rawTotalPrice.toFixed(2),
    ),

    marginPrice: Number(
      marginPrice.toFixed(2),
    ),

    marginGst: Number(
      marginGst.toFixed(2),
    ),

    retailPrice: Number(
      retailPrice.toFixed(2),
    ),
  };
}


// =========================================
// RESPONSE CALCULATIONS
// =========================================

function addProductCalculations(product) {
  const data = product.toObject();

  const calculated =
    calculateProductPrices(data);

  data.rawGstAmount =
    calculated.rawGstAmount;

  data.rawTotalPrice =
    calculated.rawTotalPrice;

  data.marginPrice =
    calculated.marginPrice;

  data.marginGst =
    calculated.marginGst;

  data.retailPrice =
    calculated.retailPrice;

  // Optional display profit
  data.profitAmount = Number(
    (
      calculated.retailPrice -
      calculated.rawTotalPrice
    ).toFixed(2),
  );

  data.profitPercentage =
    calculated.rawTotalPrice > 0
      ? Number(
          (
            (data.profitAmount /
              calculated.rawTotalPrice) *
            100
          ).toFixed(2),
        )
      : 0;

  return data;
}


// =========================================
// GET /get-products
// =========================================

export async function listProducts(
  req,
  res,
  next,
) {
  try {
    const products =
      await Product.find({
        agency: req.agencyId,
        active: true,
      }).sort({
        name: 1,
      });

    res.json({
      success: true,
      data: products.map(
        addProductCalculations,
      ),
    });
  } catch (error) {
    next(error);
  }
}


// =========================================
// GET /get-product/:id
// =========================================

export async function getProduct(
  req,
  res,
  next,
) {
  try {
    const product =
      await Product.findOne({
        _id: req.params.id,
        agency: req.agencyId,
        active: true,
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: addProductCalculations(
        product,
      ),
    });
  } catch (error) {
    next(error);
  }
}


// =========================================
// POST /create-product
// =========================================

export async function createProduct(
  req,
  res,
  next,
) {
  try {
    // Never trust frontend retailPrice
    // or calculated fields.

    const {
      name,
      brand,
      sku,
      category,
      rawPrice,
      gstRate,
      marginPercentage,
      stockQty,
      lowStockThreshold,
    } = req.body;

    const prices =
      calculateProductPrices({
        rawPrice,
        gstRate,
        marginPercentage,
      });

    const product =
      await Product.create({
        agency: req.agencyId,

        name,

        brand: brand || "",

        sku: sku || "",

        category: category || "",

        rawPrice: Number(
          rawPrice || 0,
        ),

        gstRate: Number(
          gstRate || 0,
        ),

        marginPercentage: Number(
          marginPercentage || 0,
        ),

        rawGstAmount:
          prices.rawGstAmount,

        rawTotalPrice:
          prices.rawTotalPrice,

        marginPrice:
          prices.marginPrice,

        marginGst:
          prices.marginGst,

        retailPrice:
          prices.retailPrice,

        stockQty: Number(
          stockQty || 0,
        ),

        lowStockThreshold:
          Number(
            lowStockThreshold ?? 5,
          ),
      });

    res.status(201).json({
      success: true,
      data: addProductCalculations(
        product,
      ),
    });
  } catch (error) {
    next(error);
  }
}


// =========================================
// PATCH /update-product/:id
// =========================================

export async function updateProduct(
  req,
  res,
  next,
) {
  try {
    const product =
      await Product.findOne({
        _id: req.params.id,
        agency: req.agencyId,
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      brand,
      sku,
      category,
      rawPrice,
      gstRate,
      marginPercentage,
      stockQty,
      lowStockThreshold,
      active,
    } = req.body;

    const newRawPrice =
      rawPrice !== undefined
        ? Number(rawPrice)
        : product.rawPrice;

    const newGstRate =
      gstRate !== undefined
        ? Number(gstRate)
        : product.gstRate;

    const newMarginPercentage =
      marginPercentage !== undefined
        ? Number(marginPercentage)
        : product.marginPercentage;

    const prices =
      calculateProductPrices({
        rawPrice: newRawPrice,
        gstRate: newGstRate,
        marginPercentage:
          newMarginPercentage,
      });

    product.name =
      name !== undefined
        ? name
        : product.name;

    product.brand =
      brand !== undefined
        ? brand
        : product.brand;

    product.sku =
      sku !== undefined
        ? sku
        : product.sku;

    product.category =
      category !== undefined
        ? category
        : product.category;

    product.rawPrice =
      newRawPrice;

    product.gstRate =
      newGstRate;

    product.marginPercentage =
      newMarginPercentage;

    product.rawGstAmount =
      prices.rawGstAmount;

    product.rawTotalPrice =
      prices.rawTotalPrice;

    product.marginPrice =
      prices.marginPrice;

    product.marginGst =
      prices.marginGst;

    product.retailPrice =
      prices.retailPrice;

    if (
      stockQty !== undefined
    ) {
      product.stockQty =
        Number(stockQty);
    }

    if (
      lowStockThreshold !==
      undefined
    ) {
      product.lowStockThreshold =
        Number(
          lowStockThreshold,
        );
    }

    if (
      active !== undefined
    ) {
      product.active =
        Boolean(active);
    }

    await product.save();

    res.json({
      success: true,
      data: addProductCalculations(
        product,
      ),
    });
  } catch (error) {
    next(error);
  }
}


// =========================================
// DELETE /delete-product/:id
// =========================================

export async function deleteProduct(
  req,
  res,
  next,
) {
  try {
    const product =
      await Product.findOneAndUpdate(
        {
          _id: req.params.id,
          agency: req.agencyId,
        },
        {
          $set: {
            active: false,
          },
        },
        {
          new: true,
        },
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}