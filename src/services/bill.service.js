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
// CREATE BILL
// =========================================

export async function createBill({
  agencyId,
  userId,
  data,
}) {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

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
        },
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
          "Bill must contain at least one item",
        ),
        {
          status: 400,
        },
      );
    }

    // =========================================
    // 3. GET PRODUCT IDS
    // =========================================

    const productIds = data.items.map(
      (item) => item.productId,
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
    // productId
    // qty
    //
    // Price and GST are taken directly
    // from Product DB.
    //
    // retailPrice = Product.retailPrice
    // gstRate     = Product.gstRate
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
      ]),
    );

    // =========================================
    // 5. PREPARE BILL
    // =========================================

    const billItems = [];

    let subtotal = 0;
    let gstTotal = 0;

    // =========================================
    // 6. PROCESS EACH ITEM
    // =========================================

    for (const line of data.items) {
      const product = productMap.get(
        String(line.productId),
      );

      if (!product) {
        throw Object.assign(
          new Error("Product not found"),
          {
            status: 400,
          },
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
            `${product.name}: invalid quantity`,
          ),
          {
            status: 400,
          },
        );
      }

      // =========================================
      // PRODUCT PRICE
      // =========================================
      //
      // IMPORTANT:
      //
      // Do NOT calculate retail price again here.
      //
      // Product page already calculated and
      // stored the retailPrice.
      //
      // Billing simply uses:
      //
      // product.retailPrice
      //
      // =========================================

      const retailPrice = roundMoney(
        product.retailPrice,
      );

      // =========================================
      // GST RATE
      // =========================================

      const gstRate = Number(
        product.gstRate || 0,
      );

      // =========================================
      // TAXABLE AMOUNT
      // =========================================
      //
      // Example:
      //
      // Retail Price = ₹14.58
      // Qty          = 1
      //
      // Taxable      = ₹14.58
      //
      // =========================================

      const taxable = roundMoney(
        retailPrice * qty,
      );

      // =========================================
      // BILLING GST
      // =========================================
      //
      // GST is ADDED on top of retailPrice.
      //
      // Example:
      //
      // ₹14.58 × 18%
      // = ₹2.6244
      // = ₹2.62
      //
      // =========================================

      const gst = roundMoney(
        (taxable * gstRate) / 100,
      );

      // =========================================
      // CUSTOMER TOTAL
      // =========================================
      //
      // Example:
      //
      // ₹14.58
      // + ₹2.62 GST
      // = ₹17.20
      //
      // =========================================

      const total = roundMoney(
        taxable + gst,
      );

      // =========================================
      // UPDATE BILL TOTALS
      // =========================================

      subtotal = roundMoney(
        subtotal + taxable,
      );

      gstTotal = roundMoney(
        gstTotal + gst,
      );

      // =========================================
      // SNAPSHOT PRODUCT DATA
      // =========================================
      //
      // These values are copied from Product DB.
      // They are NOT recalculated here.
      //
      // This keeps the bill as a historical
      // snapshot of the product at billing time.
      //
      // =========================================

      const rawPrice = roundMoney(
        product.rawPrice,
      );

      const rawGstAmount = roundMoney(
        product.rawGstAmount,
      );

      const rawTotalPrice = roundMoney(
        product.rawTotalPrice,
      );

      const marginPercentage = Number(
        product.marginPercentage || 0,
      );

      const marginPrice = roundMoney(
        product.marginPrice,
      );

      const marginGst = roundMoney(
        product.marginGst,
      );

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

        total,
      });
    }

    // =========================================
    // 7. GRAND TOTAL
    // =========================================
    //
    // subtotal = taxable amount
    // gstTotal = total GST
    //
    // grandTotal = subtotal + GST
    //
    // =========================================

    const grandTotal = roundMoney(
      subtotal + gstTotal,
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
            data.customerName || "",
          ).trim(),

          customerPhone: String(
            data.customerPhone || "",
          ).trim(),

          items: billItems,

          // Taxable subtotal
          subtotal: roundMoney(
            subtotal,
          ),

          // Total GST
          gstTotal: roundMoney(
            gstTotal,
          ),

          // Taxable + GST
          grandTotal: roundMoney(
            grandTotal,
          ),

          paymentMethod:
            data.paymentMethod || "CASH",
        },
      ],
      {
        session,
      },
    );

    const createdBill = bill[0];

    // =========================================
    // 9. REDUCE STOCK
    // =========================================

    for (const item of billItems) {
      const product = productMap.get(
        item.product.toString(),
      );

      const beforeQty = Number(
        product.stockQty,
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
          },
        );

      if (!updatedProduct) {
        throw Object.assign(
          new Error(
            `${product.name}: insufficient stock`,
          ),
          {
            status: 400,
          },
        );
      }

      const afterQty = Number(
        updatedProduct.stockQty,
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
        },
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
      createdBill._id,
    )
      .populate(
        "store",
        "name",
      )
      .populate(
        "createdBy",
        "name",
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