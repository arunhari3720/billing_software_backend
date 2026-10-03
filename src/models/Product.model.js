import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 160,
    },

    brand: {
      type: String,
      trim: true,
      maxLength: 100,
      default: "",
    },

    sku: {
      type: String,
      trim: true,
      maxLength: 60,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      maxLength: 80,
      default: "",
    },

    // =========================================
    // RAW / PURCHASE PRICE
    // =========================================

    rawPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // GST percentage applicable to the product
    gstRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },

    // =========================================
    // MARGIN
    // =========================================

    marginPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
      default: 0,
    },

    // Calculated margin amount
    marginPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // GST calculated on margin
    marginGst: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // =========================================
    // RETAIL / SELLING PRICE
    // =========================================
    //
    // This is the FINAL CUSTOMER SELLING PRICE.
    //
    // Billing will use this price directly.
    // Billing will NOT calculate GST again.
    //

    retailPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // =========================================
    // RAW PRICE GST
    // =========================================

    rawGstAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // rawPrice + rawGstAmount
    rawTotalPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // =========================================
    // STOCK
    // =========================================

    stockQty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 5,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

schema.index({
  agency: 1,
  sku: 1,
});

schema.index({
  agency: 1,
  active: 1,
});

schema.index({
  agency: 1,
  brand: 1,
});

export const Product = mongoose.model(
  "Product",
  schema,
);