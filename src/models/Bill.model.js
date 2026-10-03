import mongoose from "mongoose";

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

      // Customer selling subtotal
      taxable: {
        type: Number,
        required: true,
        min: 0,
      },

      // IMPORTANT:
      // Billing GST is NOT calculated again.
      //
      // Kept as 0 for compatibility.

      gst: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      // Customer payable total
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

const billSchema =
  new mongoose.Schema(
    {
      billNo: {
        type: String,
        required: true,
        index: true,
      },

      agency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Agency",
        required: true,
        index: true,
      },

      store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

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

      // Customer selling subtotal
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },

      // Billing GST = 0
      gstTotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      // Customer final payable
      grandTotal: {
        type: Number,
        required: true,
        min: 0,
      },

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

billSchema.index({
  agency: 1,
  createdAt: -1,
});

billSchema.index({
  agency: 1,
  billNo: 1,
});

export const Bill =
  mongoose.model(
    "Bill",
    billSchema,
  );