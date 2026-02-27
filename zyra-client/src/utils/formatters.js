export const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat("en-IN").format(num);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export const truncate = (str, len = 50) => {
  return str?.length > len ? `${str.slice(0, len)}...` : str;
};
