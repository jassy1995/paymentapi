 const Formatter = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "NGN",
    maximumSignificantDigits: 3,
    minimumFractionDigits: 2,
  }).format(value);

  module.exports.formatCurrency = Formatter;