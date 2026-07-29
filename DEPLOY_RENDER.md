# FACILE backend deployment on Render

The frontend remains on Vercel. This Blueprint deploys four independent Java 21 Spring Boot HTTP services. There are no background workers.

## Service inventory

| Service | Framework | Render name | Root Directory | Dockerfile Path (repo-relative) | Local port | Health | Data/infrastructure |
|---|---|---|---|---|---:|---|---|
| Auth/User | Spring Boot 3.5.16, Maven, Java 21 | `facile-auth-user` | `auth-user-service` | `./Dockerfile` | 8082 | `/actuator/health` | PostgreSQL, SMTP, Google token verification |
| Payment/Notification | Spring Boot 3.5.16, Maven, Java 21 | `facile-payment-notification` | `payment-notification-service` | `./Dockerfile` | 8084 | `/actuator/health` | PostgreSQL, Razorpay, SMTP |
| Order/Cart | Spring Boot 3.5.16, Maven, Java 21 | `facile-order-cart` | `order-cart-service` | `./Dockerfile` | 8081 | `/actuator/health` | MongoDB 7, Redis 7, payment and inventory APIs |
| Product/Inventory | Spring Boot 3.5.16, Maven, Java 21 | `facile-product-inventory` | `product-inventory-service/product-inventory-service` | `./Dockerfile` | 8083 | `/actuator/health` | PostgreSQL, auth and order APIs |

All use `runtime: docker`, Maven Wrapper, Java 21 Temurin multi-stage images, a non-root runtime user, and `PORT` (Render supplies it). Each Blueprint entry sets `dockerfilePath: ./Dockerfile` and `dockerContext: .`; both are relative to that service's `rootDir`. The Dockerfiles document port 10000.

## Environment variables

Values marked “generated URL” must be filled after the referenced Render service exists. Use a URL with no path and preferably no trailing slash.

| Service | Required | Optional |
|---|---|---|
| Auth/User | `SPRING_PROFILES_ACTIVE=prod`, `DATABASE_URL` (JDBC URL), `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `JWT_SECRET` (at least 32 random bytes represented as an even-length hex string), `FRONTEND_URL` | `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `PORT` |
| Payment/Notification | `SPRING_PROFILES_ACTIVE=prod`, `DATABASE_URL` (JDBC URL), `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `FRONTEND_URL` | `EMAIL_USERNAME`, `EMAIL_PASSWORD`, `PORT` |
| Order/Cart | `SPRING_PROFILES_ACTIVE=prod`, `MONGODB_URI`, `REDIS_URL`, `FRONTEND_URL`, `INVENTORY_SERVICE_URL`, `PAYMENT_SERVICE_URL` | `PORT` |
| Product/Inventory | `SPRING_PROFILES_ACTIVE=prod`, `DATABASE_URL` (JDBC URL), `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `FRONTEND_URL`, `AUTH_SERVICE_URL`, `ORDER_SERVICE_URL` | `PORT` |

`FRONTEND_URL` is the exact deployed Vercel origin, for example `https://your-project.vercel.app` (no path). Do not use a wildcard. Authentication uses bearer tokens rather than cookies, so credentialed CORS is intentionally disabled.

The applications use PostgreSQL JDBC directly. Render's `postgres://...` external connection string is not a JDBC URL. Use the provider's JDBC form (`jdbc:postgresql://HOST:PORT/DATABASE`) and put username/password in their separate variables. Add provider-required SSL query options, such as `?sslmode=require`, when applicable.

SMTP note: Render Free web services cannot make outbound connections on ports 25, 465, or 587. The current Gmail SMTP configuration uses 587, so email registration/reset/notification delivery requires either a paid service or an HTTPS email API code change. The APIs still build and deploy, but email flows will not work on a Free instance.

## Local infrastructure mapping

The root `docker-compose.yml` is development-only:

| Compose service | Local connection | Production replacement |
|---|---|---|
| `postgres` | `jdbc:postgresql://localhost:5432/postgres`, user `postgres` | Managed PostgreSQL -> `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` |
| `mongo-order` | `mongodb://localhost:27017/orderdb` | Managed MongoDB (for example Atlas) -> `MONGODB_URI` |
| `redis-cart` | `redis://localhost:6379` | Render Key Value or managed Redis -> `REDIS_URL` |

Never use `localhost` or a Compose hostname between separately deployed Render services. `localhost` means the current container. Free Render web services also cannot receive private-network traffic, so the four free web services must use their public HTTPS URLs.

## Deployment order

1. Provision PostgreSQL, MongoDB, and Redis/Render Key Value. Create the databases/users and collect connection settings.
2. Deploy `facile-auth-user` and `facile-payment-notification`.
3. Deploy `facile-order-cart`, setting `PAYMENT_SERVICE_URL` to the payment service URL. `INVENTORY_SERVICE_URL` can initially be a placeholder and must be corrected after step 4.
4. Deploy `facile-product-inventory`, setting `AUTH_SERVICE_URL` to auth and `ORDER_SERVICE_URL` to order.
5. Set order's `INVENTORY_SERVICE_URL` to the product/inventory URL and redeploy order.
6. Set every service's `FRONTEND_URL` to the deployed Vercel origin and redeploy affected services.
7. Configure Vercel public backend variables and redeploy the frontend.

The final URL mapping is:

| Generated URL | Assign to |
|---|---|
| Auth URL | Product `AUTH_SERVICE_URL`; Vercel `NEXT_PUBLIC_AUTH_SERVICE_URL` |
| Order URL | Product `ORDER_SERVICE_URL`; Vercel `NEXT_PUBLIC_ORDER_SERVICE_URL` |
| Payment URL | Order `PAYMENT_SERVICE_URL`; Vercel `NEXT_PUBLIC_PAYMENT_SERVICE_URL` |
| Product URL | Order `INVENTORY_SERVICE_URL`; Vercel `NEXT_PUBLIC_PRODUCT_SERVICE_URL` |

## Blueprint setup

In Render, choose **New > Blueprint**, connect this repository, and select the root `render.yaml`. Supply every value prompted by `sync: false`. The Blueprint selects the currently supported `free` web-service instance type. For real production traffic, change to an always-on paid instance type.

If creating services manually, repeat for each row in the inventory table:

1. Choose **New > Web Service**, connect this repository, and select **Docker**.
2. Enter the Render name and Root Directory exactly as shown. Set Dockerfile Path to `./Dockerfile` and Docker Build Context Directory to `.`; these fields are resolved from Root Directory.
3. Enable Auto-Deploy and set Health Check Path to `/actuator/health`.
4. Add the service's environment variables. Do not set a start command; the image supplies `java -jar app.jar`.
5. Deploy, copy the generated `https://...onrender.com` URL, and apply the URL mapping above.

## Vercel

Add these variables for Production (and Preview if desired):

```text
NEXT_PUBLIC_AUTH_SERVICE_URL=https://facile-auth-user.onrender.com
NEXT_PUBLIC_ORDER_SERVICE_URL=https://facile-order-cart.onrender.com
NEXT_PUBLIC_PAYMENT_SERVICE_URL=https://facile-payment-notification.onrender.com
NEXT_PUBLIC_PRODUCT_SERVICE_URL=https://facile-product-inventory.onrender.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=<public Razorpay key ID>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<public Google OAuth client ID>
```

Use the actual generated domains. Never expose Razorpay's secret, database credentials, JWT secret, mail password, or cloud-storage secret through `NEXT_PUBLIC_*`. In Vercel, save the variables and use **Deployments > Redeploy** because Next.js embeds public variables at build time.

## Smoke tests

Run each health check:

```powershell
Invoke-RestMethod https://facile-auth-user.onrender.com/actuator/health
Invoke-RestMethod https://facile-payment-notification.onrender.com/actuator/health
Invoke-RestMethod https://facile-order-cart.onrender.com/actuator/health
Invoke-RestMethod https://facile-product-inventory.onrender.com/actuator/health
```

Each should return `{"status":"UP"}`. Representative API checks:

```powershell
Invoke-RestMethod https://facile-product-inventory.onrender.com/api/products
Invoke-RestMethod https://facile-order-cart.onrender.com/api/cart/test@example.com
```

Auth and payment representative POST endpoints require valid request bodies and third-party configuration; test registration/login and Razorpay order creation from the deployed frontend after health checks pass.

## Schema behavior

The codebase has no Flyway or Liquibase migrations and currently uses Hibernate `ddl-auto=update`. This was preserved so a fresh managed database can initialize. It is not a substitute for controlled migrations. Before handling valuable production data, introduce versioned migrations and change production schema management to `validate`.

## Troubleshooting

- **Failed health check:** Confirm `/actuator/health` is public, the service starts, and every required database/third-party variable is present. Spring's health endpoint includes database/Redis status, so an unreachable dependency can report DOWN.
- **Port binding:** Do not hard-code a Render port. Logs should show `0.0.0.0` and the `PORT` Render assigned. The production fallback is 10000.
- **Database SSL:** Use a JDBC URL and the SSL parameters required by the provider. Do not disable certificate verification.
- **CORS:** `FRONTEND_URL` must exactly match the browser origin (scheme, host, and optional non-default port), with no path. Redeploy after changing it.
- **Inter-service connectivity:** Use public HTTPS service origins on the Free plan; never use localhost, `mongo-order`, `redis-cart`, or guessed Render domains.
- **Missing variables:** Render `sync: false` prompts require manual values. A blank Razorpay key prevents payment startup; a missing JWT secret prevents auth startup.
- **Cold starts:** Render Free web services spin down after 15 minutes without inbound traffic and can take about a minute to wake. They share 750 monthly free instance hours, use ephemeral filesystems, and are explicitly not recommended by Render for production. Free PostgreSQL expires after 30 days, and Free Key Value is in-memory and loses data on restart.
- **Email:** Free services block outbound SMTP ports including 587. Use a paid instance or migrate email delivery to an HTTPS provider API.
