# WooCommerce Extension Checklist

Apply when the project depends on WooCommerce (plugin header `Requires Plugins: woocommerce`, `wc_*` calls, `before_woocommerce_init` hook). Report findings in a separate section; they do not change the core WordPress score. Details and snippets: `REFERENCE.md` in this folder.

Severity: C = critical (release blocker), I = important, M = minor.

## Bootstrap and Compatibility

- [ ] (C) Plugin header contains `Requires Plugins: woocommerce`; code guards with `class_exists( 'WooCommerce' )` where load order matters
- [ ] (C) `FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true )` on `before_woocommerce_init`, guarded by `class_exists()`, and only if the plugin is really HPOS-safe
- [ ] (I) `FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', __FILE__, true )` declared when the plugin touches cart or checkout and has been tested with the blocks
- [ ] (M) `Requires at least` / `Requires PHP` align with the WooCommerce version the plugin supports (WooCommerce 11.2 requires WordPress 7.0 and PHP 7.4)

## HPOS and Data Access

- [ ] (C) No `get_post()`, `get_posts()`, `WP_Query`, `get_post_meta()`, `update_post_meta()`, `wp_update_post()` or `$wpdb->posts` access on orders
- [ ] (C) Orders read and written via `wc_get_order()`, `wc_get_orders()`, `$order->get_meta()`, `$order->update_meta_data()` and `$order->save()`
- [ ] (I) Admin meta boxes and assets use `wc_get_page_screen_id( 'shop-order' )` and accept both `WP_Post` and `WC_Order`
- [ ] (I) Order list columns, bulk actions and filters use HPOS hooks when both storages are supported
- [ ] (I) Code does not depend on legacy posts-table data being synchronized
- [ ] (I) Products, customers, coupons and order items use the CRUD classes (`WC_Product`, `WC_Customer`, ...) and `save()`; no direct SQL on WooCommerce tables
- [ ] (M) Queries use `wc_get_orders()` / `wc_get_products()` with `limit`, `return => 'ids'` and `paginate`; no unbounded `limit => -1` on large stores

## Money and Business Rules

- [ ] (C) Prices, totals and currency are recomputed server-side from the cart or order; client-sent amounts are never trusted
- [ ] (I) Monetary values handled as strings with `wc_format_decimal()`; display through `wc_price()`; no float arithmetic on totals
- [ ] (M) Taxes and rounding go through WooCommerce APIs (`wc_get_price_decimals()`, tax classes), not custom formulas

## Cart, Checkout and Blocks

- [ ] (I) Cart and Checkout customization works with the block checkout (Store API extension, `IntegrationInterface`, slot-fills, Additional Checkout Fields), not only classic hooks
- [ ] (I) Extension data registered with `woocommerce_store_api_register_endpoint_data()` on `woocommerce_blocks_loaded`, under the plugin's own namespace, with a schema callback
- [ ] (I) Values submitted from blocks are validated and sanitized in `woocommerce_store_api_checkout_update_order_from_request` (or the equivalent) before `update_meta_data()`
- [ ] (M) `Experimental*` slot-fills isolated behind a small adapter and covered by an E2E test, because they may change between releases
- [ ] (M) Classic shortcode checkout fallback still works when the plugin claims to support it

## Payment Gateways and Webhooks

- [ ] (C) No raw card data touches the server; hosted fields or redirect used
- [ ] (C) Incoming webhooks verify the provider signature (`hash_equals()`, timestamp tolerance) before any state change
- [ ] (C) Amount and currency from the provider are compared with the order before `payment_complete()`
- [ ] (I) Webhook handlers are idempotent (order status or transaction id checked) and respond fast, with heavy work deferred to Action Scheduler
- [ ] (I) Block checkout payment method provided (`AbstractPaymentMethodType`, registration hook, `registerPaymentMethod()`), `supports` lists only implemented features
- [ ] (I) Provider secrets live in constants or encrypted options, not in autoloaded or REST-exposed options; logs (`wc_get_logger()`) never include secrets or card data

## REST, Capabilities and Security

- [ ] (C) Custom routes have a `permission_callback` using WooCommerce capabilities (`manage_woocommerce`, `edit_shop_order`) or `wc_rest_check_*` helpers; writes never `__return_true`
- [ ] (C) Order and customer data is escaped on output (`esc_html()`, `esc_attr()`, `wp_kses_post()`); customer input sanitized with `wc_clean()` or the WordPress sanitizers
- [ ] (I) Admin actions on orders carry a nonce and a per-order capability check (`current_user_can( 'edit_shop_order', $order_id )`)
- [ ] (I) Personal data stored by the plugin has privacy exporters and erasers; order meta is cleaned on uninstall when appropriate
- [ ] (M) External `wc/v3` clients use API keys over HTTPS or Application Passwords, with least-privilege scopes

## Performance

- [ ] (I) Heavy or long jobs use Action Scheduler (`as_enqueue_async_action()`, `as_schedule_single_action()`) in chunks, not synchronous request handling
- [ ] (I) Front-end assets load only on shop, cart, checkout, account pages or where the block appears
- [ ] (M) Expensive calculations cached in transients with invalidation on product and order changes

## Tests

- [ ] (I) `php-stubs/woocommerce-stubs` available to PHPStan (version aligned with the supported WooCommerce line)
- [ ] (I) `.wp-env.json` installs WooCommerce; CI runs against the minimum supported and the latest WooCommerce
- [ ] (I) Integration tests exercise order creation, meta persistence and status transitions through the CRUD API, with HPOS enabled
- [ ] (M) E2E covers classic and block checkout for the features the plugin adds
