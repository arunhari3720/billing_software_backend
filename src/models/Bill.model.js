
import mongoose from "mongoose";

// =========================================
// BILL ITEM SCHEMA
// =========================================

const billItemSchema =
  new mongoose.Schema(
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      brand: {
        type: String,
        default: "",
      },

      sku: {
        type: String,
        default: "",
      },

      // =========================================
      // PURCHASE / RAW PRICE SNAPSHOT
      // =========================================

      rawPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      rawGstAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      rawTotalPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      // =========================================
      // MARGIN SNAPSHOT
      // =========================================

      marginPercentage: {
        type: Number,
        required: true,
        min: 0,
      },

      marginPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      marginGst: {
        type: Number,
        required: true,
        min: 0,
      },

      // =========================================
      // CUSTOMER SELLING PRICE
      // =========================================

      retailPrice: {
        type: Number,
        required: true,
        min: 0,
      },

      qty: {
        type: Number,
        required: true,
        min: 0,
      },

      // =========================================
      // GST RATE
      // =========================================

      gstRate: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      // =========================================
      // TAXABLE AMOUNT
      // =========================================
      //
      // BEFORE_TAX:
      // retail price × qty
      //
      // AFTER_TAX:
      // GST-exclusive amount extracted
      // from the GST-inclusive selling price.
      //
      // =========================================

      taxable: {
        type: Number,
        required: true,
        min: 0,
      },

      // =========================================
      // TOTAL GST
      // =========================================

      gst: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      // =========================================
      // CGST
      // =========================================

      cgst: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      // =========================================
      // SGST
      // =========================================

      sgst: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      // =========================================
      // IGST
      // =========================================

      igst: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      // =========================================
      // CUSTOMER PAYABLE TOTAL
      // =========================================

      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    {
      _id: false,
    },
  );

// =========================================
// BILL SCHEMA
// =========================================

const billSchema =
  new mongoose.Schema(
    {
      // =========================================
      // BILL NUMBER
      // =========================================

      billNo: {
        type: String,
        required: true,
        index: true,
      },

      // =========================================
      // AGENCY
      // =========================================

      agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agency",
        required: true,
        index: true,
      },

      // =========================================
      // STORE
      // =========================================

      store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
      },

      // =========================================
      // CREATED BY
      // =========================================

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      // =========================================
      // CUSTOMER
      // =========================================

      customerName: {
        type: String,
        default: "",
        trim: true,
      },

      customerPhone: {
        type: String,
        default: "",
        trim: true,
      },

      // =========================================
      // CUSTOMER STATE
      // =========================================
      //
      // Used while determining:
      //
      // Same state  -> CGST + SGST
      // Other state -> IGST
      //
      // Stored as a snapshot so historical
      // bills are not affected by later settings.
      //
      // =========================================

      customerState: {
        type: String,
        default: "",
        trim: true,
      },

      // =========================================
      // GST CONFIGURATION SNAPSHOT
      // =========================================
      //
      // These values represent the GST settings
      // that were active when this bill was created.
      //
      // =========================================

      gstEnabled: {
        type: Boolean,
        default: false,
      },

      gstCalculationMode: {
        type: String,
        enum: [
          "BEFORE_TAX",
          "AFTER_TAX",
        ],
        default: "BEFORE_TAX",
      },

      taxType: {
        type: String,
        enum: [
          "CGST_SGST",
          "IGST",
        ],
        default: "CGST_SGST",
      },

      // =========================================
      // BILL ITEMS
      // =========================================

      items: {
        type: [billItemSchema],

        required: true,

        validate: {
          validator: (
            items,
          ) =>
            Array.isArray(items) &&
            items.length > 0,

          message:
            "Bill must contain at least one item",
        },
      },

      // =========================================
      // TAXABLE SUBTOTAL
      // =========================================

      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },

      // =========================================
      // TOTAL GST
      // =========================================

      gstTotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      // =========================================
      // CGST TOTAL
      // =========================================

      cgstTotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      // =========================================
      // SGST TOTAL
      // =========================================

      sgstTotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      // =========================================
      // IGST TOTAL
      // =========================================

      igstTotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      // =========================================
      // CUSTOMER FINAL PAYABLE
      // =========================================

      grandTotal: {
        type: Number,
        required: true,
        min: 0,
      },

      // =========================================
      // PAYMENT METHOD
      // =========================================

      paymentMethod: {
        type: String,
        enum: [
          "CASH",
          "UPI",
          "CARD",
          "CREDIT",
        ],
        default: "CASH",
      },
    },
    {
      timestamps: true,
    },
  );

// =========================================
// INDEXES
// =========================================

billSchema.index({
  agency: 1,
  createdAt: -1,
});

billSchema.index({
  agency: 1,
  billNo: 1,
});

// =========================================
// MODEL
// =========================================

export const Bill =
  mongoose.model(
    "Bill",
    billSchema,
  );
