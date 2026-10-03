import { Bill } from "../models/Bill.model.js";
import { createBill } from "../services/bill.service.js";


// =========================================
// GET /get-bills
// =========================================

export async function listBills(
  req,
  res,
  next,
) {
  try {
    const bills =
      await Bill.find({
        agency:
          req.agencyId,
      })
        .populate(
          "createdBy",
          "name",
        )
        .populate(
          "store",
          "name",
        )
        .sort({
          createdAt: -1,
        })
        .limit(300);

    res.json({
      success: true,
      data: bills,
    });
  } catch (error) {
    next(error);
  }
}


// =========================================
// GET /get-bill/:id
// =========================================

export async function getBill(
  req,
  res,
  next,
) {
  try {
    const bill =
      await Bill.findOne({
        _id:
          req.params.id,

        agency:
          req.agencyId,
      })
        .populate(
          "createdBy",
          "name",
        )
        .populate(
          "store",
          "name",
        );

    if (!bill) {
      return res.status(404).json({
        success: false,
        message:
          "Bill not found",
      });
    }

    res.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    next(error);
  }
}


// =========================================
// POST /create-bill
// =========================================

export async function createBillController(
  req,
  res,
  next,
) {
  try {
    const bill =
      await createBill({
        agencyId:
          req.agencyId,

        userId:
          req.user._id,

        data:
          req.body,
      });

    res.status(201).json({
      success: true,
      data: bill,
    });
  } catch (error) {
    next(error);
  }
}


// =========================================
// GET /get-profit-report
// =========================================

export async function profitReport(
  req,
  res,
  next,
) {
  try {
    const period =
      String(
        req.query.period ||
          "all",
      ).toLowerCase();

    const date =
      String(
        req.query.date ||
          "",
      ).trim();

    const brand =
      String(
        req.query.brand ||
          "",
      ).trim();

    const productId =
      String(
        req.query.productId ||
          "",
      ).trim();

    const year =
      Number(
        req.query.year,
      );

    const month =
      Number(
        req.query.month,
      );

    const allowedPeriods = [
      "all",
      "daily",
      "monthly",
      "yearly",
    ];

    if (
      !allowedPeriods.includes(
        period,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid period",
      });
    }

    const billQuery = {
      agency:
        req.agencyId,
    };

    // =========================================
    // DAILY
    // =========================================

    if (
      period === "daily"
    ) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
          date,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid date is required for daily report",
        });
      }

      const start =
        new Date(
          `${date}T00:00:00.000`,
        );

      const end =
        new Date(start);

      end.setDate(
        end.getDate() + 1,
      );

      billQuery.createdAt = {
        $gte: start,
        $lt: end,
      };
    }

    // =========================================
    // MONTHLY
    // =========================================

    if (
      period === "monthly"
    ) {
      if (
        !Number.isInteger(
          year,
        ) ||
        year < 2000 ||
        year > 2100 ||
        !Number.isInteger(
          month,
        ) ||
        month < 1 ||
        month > 12
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid year and month are required",
        });
      }

      const start =
        new Date(
          year,
          month - 1,
          1,
        );

      const end =
        new Date(
          year,
          month,
          1,
        );

      billQuery.createdAt = {
        $gte: start,
        $lt: end,
      };
    }

    // =========================================
    // YEARLY
    // =========================================

    if (
      period === "yearly"
    ) {
      if (
        !Number.isInteger(
          year,
        ) ||
        year < 2000 ||
        year > 2100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid year is required",
        });
      }

      const start =
        new Date(
          year,
          0,
          1,
        );

      const end =
        new Date(
          year + 1,
          0,
          1,
        );

      billQuery.createdAt = {
        $gte: start,
        $lt: end,
      };
    }

    // =========================================
    // PRODUCT ID
    // =========================================

    if (
      productId &&
      !/^[a-fA-F0-9]{24}$/.test(
        productId,
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid productId",
      });
    }

    // =========================================
    // GET BILLS
    // =========================================

    const bills =
      await Bill.find(
        billQuery,
      )
        .select(
          "billNo createdAt items subtotal gstTotal grandTotal",
        )
        .lean()
        .sort({
          createdAt: -1,
        });

    // =========================================
    // SUMMARY
    // =========================================

    let totalQuantity = 0;

    let totalSales = 0;

    let totalCost = 0;

    let totalProfit = 0;

    const productMap =
      new Map();

    const brandMap =
      new Map();

    // =========================================
    // PROCESS ITEMS
    // =========================================

    for (
      const bill of bills
    ) {
      for (
        const item of
          bill.items || []
      ) {
        const itemBrand =
          String(
            item.brand ||
              "",
          ).trim();

        // =========================================
        // BRAND FILTER
        // =========================================

        if (
          brand &&
          itemBrand.toLowerCase() !==
            brand.toLowerCase()
        ) {
          continue;
        }

        const itemProductId =
          item.product
            ? item.product.toString()
            : "";

        // =========================================
        // PRODUCT FILTER
        // =========================================

        if (
          productId &&
          itemProductId !==
            productId
        ) {
          continue;
        }

        const qty =
          Number(
            item.qty || 0,
          );

        // =========================================
        // ACTUAL PURCHASE COST
        // =========================================
        //
        // rawTotalPrice includes:
        //
        // raw price
        // + raw GST
        //
        // This is the actual product cost
        // used for profit calculation.
        //

        const costPerUnit =
          Number(
            item.rawTotalPrice ??
              (
                Number(
                  item.rawPrice ||
                    0,
                ) +
                Number(
                  item.rawGstAmount ||
                    0,
                )
              ),
          );

        const cost =
          costPerUnit * qty;

        // =========================================
        // SALES
        // =========================================
        //
        // retailPrice already contains
        // margin + margin GST.
        //
        // DO NOT add GST again.
        //

        const sellingPrice =
          Number(
            item.retailPrice ??
              item.price ??
              0,
          );

        const sales =
          sellingPrice * qty;

        // =========================================
        // PROFIT
        // =========================================

        const profit =
          sales - cost;

        totalQuantity += qty;

        totalSales += sales;

        totalCost += cost;

        totalProfit += profit;

        // =========================================
        // PRODUCT REPORT
        // =========================================

        const productKey =
          itemProductId ||
          item.name;

        if (
          !productMap.has(
            productKey,
          )
        ) {
          productMap.set(
            productKey,
            {
              productId:
                itemProductId ||
                null,

              name:
                item.name ||
                "Unknown Product",

              brand:
                itemBrand,

              sku:
                item.sku ||
                "",

              quantity: 0,

              sales: 0,

              cost: 0,

              profit: 0,
            },
          );
        }

        const productRow =
          productMap.get(
            productKey,
          );

        productRow.quantity +=
          qty;

        productRow.sales +=
          sales;

        productRow.cost +=
          cost;

        productRow.profit +=
          profit;

        // =========================================
        // BRAND REPORT
        // =========================================

        const brandKey =
          itemBrand ||
          "No Brand";

        if (
          !brandMap.has(
            brandKey,
          )
        ) {
          brandMap.set(
            brandKey,
            {
              brand:
                brandKey,

              quantity: 0,

              sales: 0,

              cost: 0,

              profit: 0,
            },
          );
        }

        const brandRow =
          brandMap.get(
            brandKey,
          );

        brandRow.quantity +=
          qty;

        brandRow.sales +=
          sales;

        brandRow.cost +=
          cost;

        brandRow.profit +=
          profit;
      }
    }

    // =========================================
    // ROUND
    // =========================================

    const round = (
      value,
    ) =>
      Math.round(
        (
          Number(value) +
          Number.EPSILON
        ) * 100,
      ) / 100;

    // =========================================
    // PRODUCT RESULT
    // =========================================

    const products = [
      ...productMap.values(),
    ].map(
      (item) => ({
        ...item,

        quantity:
          round(
            item.quantity,
          ),

        sales:
          round(
            item.sales,
          ),

        cost:
          round(
            item.cost,
          ),

        profit:
          round(
            item.profit,
          ),

        profitPercentage:
          item.cost > 0
            ? round(
                (
                  item.profit /
                  item.cost
                ) * 100,
              )
            : 0,
      }),
    );

    // =========================================
    // BRAND RESULT
    // =========================================

    const brands = [
      ...brandMap.values(),
    ].map(
      (item) => ({
        ...item,

        quantity:
          round(
            item.quantity,
          ),

        sales:
          round(
            item.sales,
          ),

        cost:
          round(
            item.cost,
          ),

        profit:
          round(
            item.profit,
          ),

        profitPercentage:
          item.cost > 0
            ? round(
                (
                  item.profit /
                  item.cost
                ) * 100,
              )
            : 0,
      }),
    );

    // =========================================
    // RESPONSE
    // =========================================

    res.json({
      success: true,

      data: {
        filter: {
          period,

          date:
            period ===
            "daily"
              ? date
              : null,

          month:
            period ===
            "monthly"
              ? month
              : null,

          year:
            period ===
                "monthly" ||
            period ===
                "yearly"
              ? year
              : null,

          brand:
            brand || null,

          productId:
            productId ||
            null,
        },

        summary: {
          totalBills:
            bills.length,

          totalQuantity:
            round(
              totalQuantity,
            ),

          totalSales:
            round(
              totalSales,
            ),

          totalCost:
            round(
              totalCost,
            ),

          totalProfit:
            round(
              totalProfit,
            ),

          profitPercentage:
            totalCost > 0
              ? round(
                  (
                    totalProfit /
                    totalCost
                  ) * 100,
                )
              : 0,
        },

        products,

        brands,
      },
    });
  } catch (error) {
    next(error);
  }
}