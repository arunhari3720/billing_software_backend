const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const getRate = (value, fallback = 0) => {
  const rate = Number(value);

  if (!Number.isFinite(rate) || rate < 0) {
    return Number(fallback) || 0;
  }

  return rate;
};

export const calculateGst = ({
  amount,
  gstRate,
  calculationMode = "BEFORE_TAX",
  taxType = "CGST_SGST",
}) => {
  const price = roundMoney(amount);
  const rate = getRate(gstRate);

  if (rate === 0) {
    return {
      baseAmount: price,
      taxableAmount: price,
      gstAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalAmount: price,
      gstRate: 0,
      calculationMode,
      taxType,
    };
  }

  // --------------------------------------------------
  // BEFORE TAX
  // Example:
  // price = 1000
  // GST = 18%
  //
  // Taxable = 1000
  // GST = 180
  // Total = 1180
  // --------------------------------------------------

  if (calculationMode === "BEFORE_TAX") {
    const taxableAmount = price;

    const gstAmount = roundMoney(
      (taxableAmount * rate) / 100
    );

    const totalAmount = roundMoney(
      taxableAmount + gstAmount
    );

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === "IGST") {
      igstAmount = gstAmount;
    } else {
      cgstAmount = roundMoney(gstAmount / 2);
      sgstAmount = roundMoney(
        gstAmount - cgstAmount
      );
    }

    return {
      baseAmount: price,
      taxableAmount,
      gstAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount,
      gstRate: rate,
      calculationMode,
      taxType,
    };
  }

  // --------------------------------------------------
  // AFTER TAX
  // Example:
  // price = 1180
  // GST = 18%
  //
  // Taxable = 1000
  // GST = 180
  // Total = 1180
  // --------------------------------------------------

  if (calculationMode === "AFTER_TAX") {
    const taxableAmount = roundMoney(
      price / (1 + rate / 100)
    );

    const gstAmount = roundMoney(
      price - taxableAmount
    );

    const totalAmount = price;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === "IGST") {
      igstAmount = gstAmount;
    } else {
      cgstAmount = roundMoney(gstAmount / 2);
      sgstAmount = roundMoney(
        gstAmount - cgstAmount
      );
    }

    return {
      baseAmount: price,
      taxableAmount,
      gstAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount,
      gstRate: rate,
      calculationMode,
      taxType,
    };
  }

  throw new Error(
    `Unsupported GST calculation mode: ${calculationMode}`
  );
};