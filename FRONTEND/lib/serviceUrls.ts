const DEFAULT_SERVICE_URLS = {
  auth: "https://facile-auth-user.onrender.com",
  order: "https://facile-order-cart.onrender.com",
  payment: "https://facile-payment-notification.onrender.com",
  product: "https://facile-product-inventory.onrender.com",
} as const;

const resolveServiceUrl = (value: string | undefined, fallback: string): string => {
  const configuredValue = value?.trim();
  // The placeholder hosts have been committed to local/deployment environments before.
  // Do not let them silently break cart and payment requests.
  const isPlaceholder = configuredValue?.includes("your-") || configuredValue?.includes("example.com");
  const resolvedValue = configuredValue && !isPlaceholder ? configuredValue : fallback;
  return resolvedValue.replace(/\/+$/, "");
};

// These are the service URL variables already used by the frontend deployment.
// Explicit environment values still win, while known production defaults keep an
// incomplete deployment from targeting placeholder hosts.
export const AUTH_USER_BASE_URL = resolveServiceUrl(
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
  DEFAULT_SERVICE_URLS.auth
);
export const PRODUCT_BASE_URL = resolveServiceUrl(
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL,
  DEFAULT_SERVICE_URLS.product
);
export const ORDER_BASE_URL = resolveServiceUrl(
  process.env.NEXT_PUBLIC_ORDER_SERVICE_URL,
  DEFAULT_SERVICE_URLS.order
);
export const PAYMENT_BASE_URL = resolveServiceUrl(
  process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL,
  DEFAULT_SERVICE_URLS.payment
);

const serviceUrl = (baseUrl: string, path: string): string =>
  `${baseUrl}/${path.replace(/^\/+/, "")}`;

export const authApiUrl = (path: string) => serviceUrl(AUTH_USER_BASE_URL, path);
export const productApiUrl = (path: string) => serviceUrl(PRODUCT_BASE_URL, path);
export const orderApiUrl = (path: string) => serviceUrl(ORDER_BASE_URL, path);
export const paymentApiUrl = (path: string) => serviceUrl(PAYMENT_BASE_URL, path);
