import mongoose from "mongoose";

const gstSettingSchema = new mongoose.Schema(
  {
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agency",
      required: true,
      unique: true,
      index: true,
    },

    enabled: {
      type: Boolean,
      default: false,
    },

    // BEFORE_TAX:
    // Product price is taxable/base price, GST is added.
    //
    // AFTER_TAX:
    // Product price already contains GST, GST is reverse calculated.
    calculationMode: {
      type: String,
      enum: ["BEFORE_TAX", "AFTER_TAX"],
      default: "BEFORE_TAX",
    },

    // AUTO:
    // Decide based on seller/customer state.
    //
    // CGST_SGST:
    // Force intra-state calculation.
    //
    // IGST:
    // Force inter-state calculation.
    taxType: {
      type: String,
      enum: ["AUTO", "CGST_SGST", "IGST"],
      default: "AUTO",
    },

    defaultGstRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 18,
    },

    sellerState: {
      type: String,
      trim: true,
      default: "",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("GstSetting", gstSettingSchema);