# FACILE production database deployment

This guide contains no provider credentials. Keep all real values in ignored local environment files or in Render's secret environment-variable store.

## Final database mapping

| Service | Production database | Local database | Owned tables or collections |
|---|---|---|---|
| `auth-user-service` | Supabase PostgreSQL | Docker PostgreSQL, `localhost:5432/postgres` | `users`, `user_sessions`, `audit_logs` |
| `payment-notification-service` | Supabase PostgreSQL | Docker PostgreSQL, `localhost:5432/postgres` | `payments`, `wallets`, `gift_cards` |
| `product-inventory-service` | Supabase PostgreSQL | Docker PostgreSQL, `localhost:5432/postgres` | `products`, `product_images`, `product_reviews`, `inventories`, `categories`, `sub_categories` |
| `order-cart-service` | MongoDB Atlas, database `orderdb` | Docker MongoDB, `localhost:27018/orderdb` | `carts`, `orders`, `checkout_sagas` |

All PostgreSQL table names are distinct, so the three services can currently share one Supabase project and its `public` schema. This is compatible with the existing mappings, although separate schemas and database roles should be considered later for stronger service isolation.

Redis is not used by application code. Its Spring dependency and configuration have been removed. The root Compose container remains available for now, but it can be removed later after confirming no external local workflow depends on it.

## Supabase setup

1. Create a Supabase project and create a strong database password.
2. Open **Connect** in the project dashboard.
3. Choose the **Session Pooler** connection suitable for persistent JVM connections.
4. Copy the pooler host, port, database, and username.
5. Construct a JDBC URL:

   ```text
   jdbc:postgresql://POOLER_HOST:POOLER_PORT/postgres?sslmode=require
   ```

6. Put the JDBC URL, pooler username, and database password into each applicable Render service as `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD`.

Do not put a raw `postgres://` URI into `DATABASE_URL`; Spring JDBC expects the `jdbc:postgresql://` form. SSL is enabled through `sslmode=require` in the JDBC URL.

Supabase values have different purposes:

- **Project API URL:** HTTP endpoint used by Supabase client libraries. It is not a JDBC URL.
- **JDBC PostgreSQL URL:** Connection used by these Spring/JPA services.
- **Database password:** Authenticates the PostgreSQL user and must remain secret.
- **Anon key:** Public client API key governed by Row Level Security. These services do not need it.
- **Service-role key:** Privileged API key that bypasses Row Level Security. These services do not need it and it must never be exposed to the browser.

Hibernate `ddl-auto=update` is retained temporarily because the repository has no Flyway or Liquibase migrations. It allows an empty first deployment to create tables. Introduce versioned migrations before valuable production data accumulates, then change production schema handling to `validate`. Never use `create` or `create-drop` in production.

## MongoDB Atlas setup

1. Create an Atlas project and a free cluster if that option is currently available.
2. Create a database user and grant it read/write access to `orderdb`.
3. Configure **Network Access** for the Render outbound network policy you intend to use. Avoid unnecessarily broad access where fixed outbound addresses are available.
4. Copy the **Drivers** connection string.
5. Insert `/orderdb` before the query string.
6. Set the resulting URI as `MONGODB_URI` in Render:

   ```text
   mongodb+srv://USERNAME:ENCODED_PASSWORD@CLUSTER/orderdb?retryWrites=true&w=majority
   ```

MongoDB usernames and passwords containing reserved URI characters must be percent/URL-encoded. Do not paste an unencoded password containing characters such as `@`, `:`, `/`, `?`, `#`, or `%`.

The database name must remain `orderdb`; existing mappings preserve `carts`, `orders`, and `checkout_sagas`.

## Render environment variables

Only variables referenced by current application code or configuration are listed.

### `facile-auth-user`

```text
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
FRONTEND_URL
EMAIL_USERNAME
EMAIL_PASSWORD
```

Optional pool overrides are `DB_MAX_POOL_SIZE`, `DB_MIN_IDLE`, and `DB_CONNECTION_TIMEOUT`.

### `facile-payment-notification`

```text
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
FRONTEND_URL
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
EMAIL_USERNAME
EMAIL_PASSWORD
```

Optional pool overrides are `DB_MAX_POOL_SIZE`, `DB_MIN_IDLE`, and `DB_CONNECTION_TIMEOUT`.

### `facile-product-inventory`

```text
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
FRONTEND_URL
AUTH_SERVICE_URL
ORDER_SERVICE_URL
```

Optional pool overrides are `DB_MAX_POOL_SIZE`, `DB_MIN_IDLE`, and `DB_CONNECTION_TIMEOUT`.

### `facile-order-cart`

```text
SPRING_PROFILES_ACTIVE=prod
MONGODB_URI
FRONTEND_URL
INVENTORY_SERVICE_URL
PAYMENT_SERVICE_URL
```

Render supplies `PORT`; every service also accepts an explicit `PORT` if needed.

## Local development

The root `docker-compose.yml` exposes:

```text
PostgreSQL: localhost:5432, database postgres
MongoDB:    localhost:27017, database orderdb
Redis:      localhost:6379 (legacy container; no backend currently uses it)
```

Each Spring service imports its ignored `.env` from its own working directory.

PostgreSQL services use:

```text
SPRING_PROFILES_ACTIVE=local
DATABASE_URL=jdbc:postgresql://localhost:5432/postgres
DATABASE_USERNAME
DATABASE_PASSWORD
FRONTEND_URL=http://localhost:3000
```

Auth additionally requires `JWT_SECRET`; auth and payment require their applicable email/provider variables. Product uses `AUTH_SERVICE_URL=http://localhost:8082` and `ORDER_SERVICE_URL=http://localhost:8081`.

Order/cart uses:

```text
SPRING_PROFILES_ACTIVE=local
MONGODB_URI=mongodb://localhost:27018/orderdb
FRONTEND_URL=http://localhost:3000
INVENTORY_SERVICE_URL=http://localhost:8083
PAYMENT_SERVICE_URL=http://localhost:8084
```

Order/cart has no JWT configuration or auth-service URL in its current code, so those variables are intentionally not added.

## Migrating existing local data

### PostgreSQL

Run tools from a trusted shell without embedding passwords in command history. One approach is:

```text
pg_dump --host=localhost --port=5432 --username=postgres --format=custom --file=facile.dump postgres
pg_restore --host=SUPABASE_POOLER_HOST --port=SUPABASE_POOLER_PORT --username=SUPABASE_POOLER_USER --dbname=postgres --clean --if-exists --no-owner facile.dump
```

Set `PGPASSWORD` only in the current shell or allow the tools to prompt. Review `--clean` carefully: it replaces matching destination objects. For a new empty project, omit `--clean --if-exists` when replacement is not intended.

Because all three local services share one PostgreSQL database, a full dump includes all their tables. Use `--table` selections when migrating service-by-service.

### MongoDB

```text
mongodump --uri=mongodb://localhost:27018/orderdb --archive=orderdb.archive
mongorestore --uri="mongodb+srv://USERNAME@CLUSTER/orderdb?retryWrites=true&w=majority" --archive=orderdb.archive --nsInclude="orderdb.*"
```

Allow the tools to prompt or use a secure credential mechanism. Do not store an Atlas password in scripts or documentation.

If local data is disposable, skip dump/restore. Hibernate can initialize empty PostgreSQL tables temporarily, existing product seed logic can populate catalog data, and Spring Data MongoDB creates collections as documents are written.

## Deployment order

1. Create the Supabase project.
2. Create the MongoDB Atlas project, cluster, user, and network rule.
3. Add database and application variables to Render.
4. Deploy auth.
5. Deploy product/inventory.
6. Deploy order/cart.
7. Deploy payment/notification.
8. Replace local or placeholder inter-service URLs with the deployed HTTPS service origins.
9. Redeploy services affected by URL changes.
10. In Vercel, set `NEXT_PUBLIC_AUTH_SERVICE_URL`, `NEXT_PUBLIC_ORDER_SERVICE_URL`, `NEXT_PUBLIC_PRODUCT_SERVICE_URL`, and `NEXT_PUBLIC_PAYMENT_SERVICE_URL` to the public service origins, then redeploy the frontend.

## Security

- Never put passwords, JWT secrets, MongoDB URIs, Razorpay secrets, email passwords, or database credentials in `NEXT_PUBLIC_*` variables.
- A Razorpay key ID and Google client ID may be public when required by their browser SDKs; their corresponding secrets may not.
- Never commit `.env`, `.env.local`, or `.env.production`.
- Rotate any credentials that have previously been committed, even after the files are removed from the current index.

If tracked environment files must be removed from Git while remaining on disk, run these commands manually after reviewing them:

```text
git rm --cached -- auth-user-service/.env
git rm --cached -- payment-notification-service/.env
git rm --cached -- FRONTEND/.env
git commit -m "Stop tracking local environment files"
```

Do not use `git rm` without `--cached`; that would remove the local files.

## Troubleshooting

- **Invalid JDBC URL:** Ensure it starts with `jdbc:postgresql://`, not `postgres://` and not the Supabase HTTP API URL.
- **PostgreSQL SSL error:** Ensure the JDBC query contains `sslmode=require`.
- **Wrong pooler username:** Copy the complete Session Pooler username shown by Supabase; it may differ from a direct database username.
- **Atlas authentication failure:** Verify the Atlas database user, encoded password, authentication permissions, and `orderdb` path.
- **Atlas server-selection/IP error:** Verify Atlas Network Access permits Render's outbound connection.
- **URI encoding error:** Percent-encode reserved characters in the Atlas username/password.
- **Hibernate does not create tables:** Check database permissions and startup logs, and confirm temporary `ddl-auto=update` is active.
- **Health check fails:** Test `/actuator/health`, verify the database is reachable, and confirm no stale `REDIS_URL` or Redis health expectation remains in the deployed environment.
- **Connection exhaustion:** Keep the default five-connection Hikari pool or lower it across services to remain within the Supabase pooler's project limit.
