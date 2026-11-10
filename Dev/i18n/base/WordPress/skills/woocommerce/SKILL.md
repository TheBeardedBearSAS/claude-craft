---
name: "woocommerce"
description: "WooCommerce extension development (HPOS, CRUD, Store API, Cart/Checkout blocks). Use when the project extends WooCommerce: Requires Plugins: woocommerce, wc_* APIs, orders, products, checkout."
allowed-tools:
  - Read
  - Glob
  - Grep
---

# WooCommerce Extension Development

Optional module of the WordPress stack (WooCommerce 11.2 line, WordPress 7.0+, PHP 7.4+). Load it only when the project depends on WooCommerce. The WordPress core rules (hooks, security, i18n, tests) still apply.

## When to Use

- Plugin header has `Requires Plugins: woocommerce`, or code calls `wc_*` functions, `WC_Order`, `WC_Product`, `WC()`
- Work touches orders, products, customers, cart, checkout, payment gateways, shipping, emails or webhooks
- A `before_woocommerce_init` hook or `FeaturesUtil` call is present or missing

## Key Rules

1. **HPOS first**: orders are not posts. Use `wc_get_order()`, `wc_get_orders()`, `$order->get_meta()` and `$order->update_meta_data()` followed by `$order->save()`. Never `get_post()`, `WP_Query` or `*_post_meta()` on orders
2. **Declare compatibility** on `before_woocommerce_init` with `FeaturesUtil::declare_compatibility()` for `custom_order_tables` and `cart_checkout_blocks`, guarded by `class_exists()`
3. **Use the CRUD layer** (`WC_Data`, `WC_Product`, `WC_Customer`, `WC_Order`) for reads and writes; avoid direct SQL on WooCommerce tables
4. **Blocks-ready checkout**: extend Cart and Checkout through the Store API (`woocommerce_store_api_register_endpoint_data`, `ExtendSchema`) and block integrations (`IntegrationInterface`, slot-fills), not only classic template hooks
5. **Security**: verify payment webhooks (signature plus `hash_equals()`), never trust client-sent prices or totals, check capabilities (`manage_woocommerce`, `edit_shop_order`), escape all order data on output
6. **Dependency guard**: do not run when WooCommerce is inactive; rely on `Requires Plugins` and check `class_exists( 'WooCommerce' )` for load-order safety

## Where to Look

- Detailed APIs, snippets, hooks, Store API, gateways, REST, testing: `REFERENCE.md` (this folder)
- Auditable items for reviews and `/wordpress:check`: `checklist.md` (this folder)
- Core WordPress rules: `.claude/references/wordpress/rules/`

## Workflow

1. Read `REFERENCE.md` sections matching the task (HPOS, CRUD, blocks, gateway, REST, tests)
2. Write the failing test first (`WP_UnitTestCase` with WooCommerce active in `wp-env`)
3. Implement through CRUD and hooks; declare feature compatibility
4. Walk `checklist.md` before commit and report findings separately from the core WordPress score
