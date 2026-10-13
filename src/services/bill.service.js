
import mongoose from "mongoose";

import { Bill } from "../models/Bill.model.js";
import { Product } from "../models/Product.model.js";
import { Store } from "../models/Store.model.js";
import { StockMovement } from "../models/StockMovement.model.js";

import { makeBillNumber } from "../utils/billNumber.js";

// =========================================
// MONEY ROUNDING
// =========================================

function roundMoney(value) {
  return Number(Number(value || 0).toFixed(2));
}

// =========================================
// RESOLVE TAX TYPE
// =========================================

function resolveTaxType({
  configuredTaxType,
  sellerState,
  customerState,
}) {
  // Explicit IGST
  if (configuredTaxType === "IGST") {
    return "IGST";
  }

  // Explicit CGST + SGST
  if (configuredTaxType === "CGST_SGST") {
    return "CGST_SGST";
  }

  // AUTO
  //
  // Same state  -> CGST + SGST
  // Different   -> IGST
  //
  // If state information is unavailable,
  // fallback to CGST + SGST.

  const seller = String(sellerState || "")
    .trim()
    .toLowerCase();

  const customer = String(customerState || "")
    .trim()
    .toLowerCase();

  if (!seller || !customer) {
    return "CGST_SGST";
  }

  return seller === customer
    ? "CGST_SGST"
    : "IGST";
}

// =========================================
// CALCULATE GST
// =========================================

function calculateGst({
  amount,
  gstRate,
  enabled,
  calculationMode,
  taxType,
}) {
  const price = roundMoney(amount);

  // =========================================
  // GST DISABLED
  // =========================================

  if (!enabled) {
    return {
      taxable: price,
      gst: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: price,
    };
  }

  const rate = Number(gstRate || 0);

  if (!Number.isFinite(rate) || rate < 0) {
    return {
      taxable: price,
      gst: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: price,
    };
  }

  // =========================================
  // ZERO GST
  // =========================================

  if (rate === 0) {
    return {
      taxable: price,
      gst: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: price,
    };
  }

  let taxable;
  let gst;
  let total;

  // =========================================
  // BEFORE TAX
  // =========================================
  //
  // Example:
  //
  // Price = ₹1000
  // GST   = 18%
  //
  // Taxable = ₹1000
  // GST     = ₹180
  // Total   = ₹1180
  //
  // =========================================

  if (calculationMode === "BEFORE_TAX") {
    taxable = price;

    gst = roundMoney(
      (taxable * rate) / 100
    );

    total = roundMoney(
      taxable + gst
    );
  }

  // =========================================
  // AFTER TAX
  // =========================================
  //
  // Example:
  //
  // Price = ₹1180
  // GST   = 18%
  //
  // Taxable = ₹1000
  // GST     = ₹180
  // Total   = ₹1180
  //
  // =========================================

  else if (calculationMode === "AFTER_TAX") {
    total = price;

    taxable = roundMoney(
      total / (1 + rate / 100)
    );

    gst = roundMoney(
      total - taxable
    );
  }

  // =========================================
  // SAFETY FALLBACK
  // =========================================

  else {
    taxable = price;

    gst = roundMoney(
      (taxable * rate) / 100
    );

    total = roundMoney(
      taxable + gst
    );
  }

  // =========================================
  // SPLIT TAX
  // =========================================

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (taxType === "IGST") {
    igst = gst;
  } else {
    cgst = roundMoney(gst / 2);

    // Keep total GST exact after rounding
    sgst = roundMoney(gst - cgst);
  }

  return {
    taxable: roundMoney(taxable),
    gst: roundMoney(gst),

    cgst,
    sgst,
    igst,

    total: roundMoney(total),
  };
}

// =========================================
// CREATE BILL
// =========================================

export async function createBill({
  agencyId,
  userId,
  data,
  gstSettings,
}) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // =========================================
    // GST CONFIGURATION
    // =========================================

    const gstConfig = {
      enabled: Boolean(
        gstSettings?.enabled
      ),

      calculationMode:
        gstSettings?.calculationMode ||
        "BEFORE_TAX",

      taxType:
        gstSettings?.taxType ||
        "AUTO",

      defaultGstRate:
        Number(
          gstSettings?.defaultGstRate ?? 18
        ),

      sellerState:
        gstSettings?.sellerState || "",
    };

    // =========================================
    // CUSTOMER STATE
    // =========================================

    const customerState =
      data.customerState ||
      data.placeOfSupply ||
      "";

    // =========================================
    // RESOLVE TAX TYPE
    // =========================================

    const resolvedTaxType =
      resolveTaxType({
        configuredTaxType:
          gstConfig.taxType,

        sellerState:
          gstConfig.sellerState,

        customerState,
      });

    // =========================================
    // 1. VALIDATE STORE
    // =========================================

    const store = await Store.findOne({
      _id: data.storeId,
      agency: agencyId,
      active: true,
    }).session(session);

    if (!store) {
      throw Object.assign(
        new Error("Invalid store"),
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 2. VALIDATE ITEMS
    // =========================================

    if (
      !Array.isArray(data.items) ||
      data.items.length === 0
    ) {
      throw Object.assign(
        new Error(
          "Bill must contain at least one item"
        ),
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 3. GET PRODUCT IDS
    // =========================================

    const productIds = data.items.map(
      (item) => item.productId
    );

    // =========================================
    // 4. GET PRODUCTS FROM DATABASE
    // =========================================
    //
    // IMPORTANT:
    //
    // We DO NOT trust frontend price.
    //
    // Frontend only sends:
    //
    // productId
    // qty
    //
    // Price and GST are taken directly
    // from Product DB.
    //
    // =========================================

    const products = await Product.find({
      _id: {
        $in: productIds,
      },

      agency: agencyId,

      active: true,
    }).session(session);

    const productMap = new Map(
      products.map((product) => [
        product._id.toString(),
        product,
      ])
    );

    // =========================================
    // 5. PREPARE BILL
    // =========================================

    const billItems = [];

    let subtotal = 0;

    let gstTotal = 0;

    let cgstTotal = 0;

    let sgstTotal = 0;

    let igstTotal = 0;

    // =========================================
    // 6. PROCESS EACH ITEM
    // =========================================

    for (const line of data.items) {
      const product = productMap.get(
        String(line.productId)
      );

      if (!product) {
        throw Object.assign(
          new Error("Product not found"),
          {
            status: 400,
          }
        );
      }

      // =========================================
      // QUANTITY
      // =========================================

      const qty = Number(line.qty);

      if (
        !Number.isFinite(qty) ||
        qty <= 0
      ) {
        throw Object.assign(
          new Error(
            `${product.name}: invalid quantity`
          ),
          {
            status: 400,
          }
        );
      }

      // =========================================
      // PRODUCT PRICE
      // =========================================
      //
      // IMPORTANT:
      //
      // We always take retailPrice from DB.
      //
      // GST setting decides whether this price
      // is treated as:
      //
      // BEFORE TAX
      // OR
      // AFTER TAX
      //
      // =========================================

      const retailPrice = roundMoney(
        product.retailPrice
      );

      const lineAmount = roundMoney(
        retailPrice * qty
      );

      // =========================================
      // GST RATE
      // =========================================
      //
      // Product GST rate has priority.
      //
      // If product GST rate is missing/invalid,
      // use agency default GST rate.
      //
      // =========================================

      let gstRate = Number(
        product.gstRate
      );

      if (
        !Number.isFinite(gstRate) ||
        gstRate < 0
      ) {
        gstRate =
          gstConfig.defaultGstRate;
      }

      // If GST is disabled, rate becomes 0.
      if (!gstConfig.enabled) {
        gstRate = 0;
      }

      // =========================================
      // CALCULATE GST
      // =========================================

      const gstCalculation =
        calculateGst({
          amount: lineAmount,

          gstRate,

          enabled:
            gstConfig.enabled,

          calculationMode:
            gstConfig.calculationMode,

          taxType:
            resolvedTaxType,
        });

      const taxable =
        gstCalculation.taxable;

      const gst =
        gstCalculation.gst;

      const cgst =
        gstCalculation.cgst;

      const sgst =
        gstCalculation.sgst;

      const igst =
        gstCalculation.igst;

      const total =
        gstCalculation.total;

      // =========================================
      // UPDATE BILL TOTALS
      // =========================================

      subtotal = roundMoney(
        subtotal + taxable
      );

      gstTotal = roundMoney(
        gstTotal + gst
      );

      cgstTotal = roundMoney(
        cgstTotal + cgst
      );

      sgstTotal = roundMoney(
        sgstTotal + sgst
      );

      igstTotal = roundMoney(
        igstTotal + igst
      );

      // =========================================
      // SNAPSHOT PRODUCT DATA
      // =========================================

      const rawPrice = roundMoney(
        product.rawPrice
      );

      const rawGstAmount = roundMoney(
        product.rawGstAmount
      );

      const rawTotalPrice = roundMoney(
        product.rawTotalPrice
      );

      const marginPercentage =
        Number(
          product.marginPercentage || 0
        );

      const marginPrice = roundMoney(
        product.marginPrice
      );

      const marginGst = roundMoney(
        product.marginGst
      );

      // =========================================
      // BILL ITEM
      // =========================================

      billItems.push({
        product: product._id,

        name: product.name,

        brand: product.brand || "",

        sku: product.sku || "",

        rawPrice,

        rawGstAmount,

        rawTotalPrice,

        marginPercentage,

        marginPrice,

        marginGst,

        retailPrice,

        qty,

        taxable,

        gstRate,

        gst,

        cgst,

        sgst,

        igst,

        total,
      });
    }

    // =========================================
    // 7. GRAND TOTAL
    // =========================================

    const grandTotal = roundMoney(
      subtotal + gstTotal
    );

    // =========================================
    // 8. CREATE BILL
    // =========================================

    const bill = await Bill.create(
      [
        {
          billNo: makeBillNumber("BILL"),

          agency: agencyId,

          store: store._id,

          createdBy: userId,

          customerName: String(
            data.customerName || ""
          ).trim(),

          customerPhone: String(
            data.customerPhone || ""
          ).trim(),

          // Customer state is useful for
          // GST audit/history.
          customerState: String(
            customerState || ""
          ).trim(),

          // Snapshot GST configuration used
          // when this bill was created.
          gstEnabled:
            gstConfig.enabled,

          gstCalculationMode:
            gstConfig.calculationMode,

          taxType:
            resolvedTaxType,

          items: billItems,

          // =====================================
          // TAXABLE SUBTOTAL
          // =====================================

          subtotal: roundMoney(
            subtotal
          ),

          // =====================================
          // GST BREAKDOWN
          // =====================================

          gstTotal: roundMoney(
            gstTotal
          ),

          cgstTotal: roundMoney(
            cgstTotal
          ),

          sgstTotal: roundMoney(
            sgstTotal
          ),

          igstTotal: roundMoney(
            igstTotal
          ),

          // =====================================
          // FINAL TOTAL
          // =====================================

          grandTotal: roundMoney(
            grandTotal
          ),

          paymentMethod:
            data.paymentMethod || "CASH",
        },
      ],
      {
        session,
      }
    );

    const createdBill = bill[0];

    // =========================================
    // 9. REDUCE STOCK
    // =========================================

    for (const item of billItems) {
      const product = productMap.get(
        item.product.toString()
      );

      const beforeQty = Number(
        product.stockQty
      );

      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: product._id,

            agency: agencyId,

            active: true,

            stockQty: {
              $gte: item.qty,
            },
          },

          {
            $inc: {
              stockQty: -item.qty,
            },
          },

          {
            new: true,

            session,

            runValidators: true,
          }
        );

      if (!updatedProduct) {
        throw Object.assign(
          new Error(
            `${product.name}: insufficient stock`
          ),
          {
            status: 400,
          }
        );
      }

      const afterQty = Number(
        updatedProduct.stockQty
      );

      // =========================================
      // STOCK MOVEMENT
      // =========================================

      await StockMovement.create(
        [
          {
            agency: agencyId,

            product: product._id,

            type: "OUT",

            qty: item.qty,

            beforeQty,

            afterQty,

            referenceType: "BILL",

            referenceId:
              createdBill._id,

            createdBy: userId,
          },
        ],
        {
          session,
        }
      );
    }

    // =========================================
    // 10. COMMIT TRANSACTION
    // =========================================

    await session.commitTransaction();

    // =========================================
    // 11. RETURN BILL
    // =========================================

    return Bill.findById(
      createdBill._id
    )
      .populate(
        "store",
        "name"
      )
      .populate(
        "createdBy",
        "name"
      );
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
}
