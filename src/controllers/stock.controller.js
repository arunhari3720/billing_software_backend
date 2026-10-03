import { Product } from "../models/Product.model.js";
import { StockMovement } from "../models/StockMovement.model.js";

export async function stockSummary(
  req,
  res,
  next
) {
  try {
    const [
      products,
      movements,
    ] = await Promise.all([
      Product.find({
        agency: req.agencyId,
        active: true,
      }).sort({
        name: 1,
      }),

      StockMovement.find({
        agency: req.agencyId,
      })
        .populate(
          "product",
          "name brand sku rawPrice retailPrice"
        )
        .populate(
          "createdBy",
          "name"
        )
        .sort({
          createdAt: -1,
        })
        .limit(200),
    ]);

    const totalUnits =
      products.reduce(
        (sum, product) =>
          sum +
          Number(product.stockQty || 0),
        0
      );

    const stockCostValue =
      products.reduce(
        (sum, product) =>
          sum +
          Number(product.stockQty || 0) *
            Number(product.rawPrice || 0),
        0
      );

    const stockRetailValue =
      products.reduce(
        (sum, product) =>
          sum +
          Number(product.stockQty || 0) *
            Number(product.retailPrice || 0),
        0
      );

    const potentialProfit =
      stockRetailValue -
      stockCostValue;

    res.json({
      success: true,

      data: {
        products,

        movements,

        totalUnits,

        stockCostValue: Number(
          stockCostValue.toFixed(2)
        ),

        stockRetailValue: Number(
          stockRetailValue.toFixed(2)
        ),

        potentialProfit: Number(
          potentialProfit.toFixed(2)
        ),
      },
    });
  } catch (e) {
    next(e);
  }
}