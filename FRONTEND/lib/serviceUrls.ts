const requireServiceUrl = (value: string | undefined, variableName: string): string => {
  if (!value) {
    throw new Error(`Missing required frontend service URL: ${variableName}`);
  }
  return value.replace(/\/+$/, "");
};

// These are the service URL variables already used by the frontend deployment.
// They are intentionally not interchangeable with similarly named variables.
export const AUTH_USER_BASE_URL = requireServiceUrl(
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL,
  "NEXT_PUBLIC_AUTH_SERVICE_URL"
);
export const PRODUCT_BASE_URL = requireServiceUrl(
  process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL,
  "NEXT_PUBLIC_PRODUCT_SERVICE_URL"
);
export const ORDER_BASE_URL = requireServiceUrl(
  process.env.NEXT_PUBLIC_ORDER_SERVICE_URL,
  "NEXT_PUBLIC_ORDER_SERVICE_URL"
);
export const PAYMENT_BASE_URL = requireServiceUrl(
  process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL,
  "NEXT_PUBLIC_PAYMENT_SERVICE_URL"
);

const serviceUrl = (baseUrl: string, path: string): string =>
  `${baseUrl}/${path.replace(/^\/+/, "")}`;

export const authApiUrl = (path: string) => serviceUrl(AUTH_USER_BASE_URL, path);
export const productApiUrl = (path: string) => serviceUrl(PRODUCT_BASE_URL, path);
export const orderApiUrl = (path: string) => serviceUrl(ORDER_BASE_URL, path);
export const paymentApiUrl = (path: string) => serviceUrl(PAYMENT_BASE_URL, path);
