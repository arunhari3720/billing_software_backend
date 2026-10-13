import GstSetting from "../models/GstSetting.js";
import { gstSettingSchema } from "../validations/gst.validation.js";

// export const getGstSetting = async (req, res) => {
//   try {
//     const agencyId = req.agencyId;

//     let setting = await GstSetting.findOne({
//       agency: agencyId,
//     });

//     // First time → create default settings
//     if (!setting) {
//       setting = await GstSetting.create({
//         agency: agencyId,
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: setting,
//     });
//   } catch (error) {
//     console.error("getGstSetting error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch GST settings",
//     });
//   }
// };
export const getGstSetting = async (req, res) => {
  try {
    const agencyId = req.agencyId;

    // Verify authenticated user's agency
    if (!agencyId) {
      console.error("GST settings: req.agencyId is missing");

      return res.status(401).json({
        success: false,
        message: "Agency information missing. Please login again.",
      });
    }

    let setting = await GstSetting.findOne({
      agency: agencyId,
    });

    // Create default settings on first request
    if (!setting) {
      setting = await GstSetting.create({
        agency: agencyId,
      });
    }

    return res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("getGstSetting error:", {
      name: error.name,
      message: error.message,
      errors: error.errors,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch GST settings",
    });
  }
};
export const updateGstSetting = async (req, res) => {
  try {
    const agencyId = req.agencyId;

    const parsed = gstSettingSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid GST settings",
        errors: parsed.error.flatten(),
      });
    }

    const setting = await GstSetting.findOneAndUpdate(
      {
        agency: agencyId,
      },
      {
        $set: {
          ...parsed.data,
          agency: agencyId,
          updatedBy: req.user?._id,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "GST settings updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error("updateGstSetting error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update GST settings",
    });
  }
};