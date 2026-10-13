import mongoose from "mongoose";

const productOptionSchema = new mongoose.Schema(
  {
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["BRAND", "CATEGORY"],
      required: true,
    },

    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    // Case-insensitive duplicate prevention
    normalizedValue: {
      type: String,
      required: true,
      trim: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productOptionSchema.index(
  {
    agency: 1,
    type: 1,
    normalizedValue: 1,
  },
  { unique: true }
);

productOptionSchema.index({
  agency: 1,
  type: 1,
  active: 1,
});

const ProductOption = mongoose.model(
  "ProductOption",
  productOptionSchema
);

export default ProductOption;