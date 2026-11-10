# WooCommerce Extension Reference

> Scope: extending WooCommerce 11.2 (reference 11.2.2; requires WordPress 7.0 and PHP 7.4) from plugins. Complements the WordPress rules; does not repeat them. Out of scope: store operations, hosting, themes for stores beyond block theme basics.

## 1. Dependency and Bootstrap

- Plugin header: `Requires Plugins: woocommerce` makes WordPress block activation without WooCommerce
- Start WooCommerce-dependent code on `plugins_loaded` (after WooCommerce loads) or `woocommerce_loaded` / `woocommerce_init`; guard with `class_exists( 'WooCommerce' )`
- Declare feature compatibility early, on `before_woocommerce_init`

```php
add_action(
	'before_woocommerce_init',
	static function () {
		if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', __FILE__, true );
		}
	}
);
```

Only declare compatibility you have verified; declaring `false` warns merchants who try to enable the feature.

## 2. HPOS (High-Performance Order Storage)

Orders live in dedicated tables (`wc_orders`, `wc_orders_meta`, ...), not in `wp_posts` / `wp_postmeta`.

| Do | Do not |
|----|--------|
| `wc_get_order( $id )`, `wc_get_orders( $args )` | `get_post( $order_id )`, `new WP_Query( array( 'post_type' => 'shop_order' ) )` |
| `$order->get_meta( 'key' )` | `get_post_meta( $order_id, 'key', true )` |
| `$order->update_meta_data( 'key', $v ); $order->save();` | `update_post_meta( $order_id, 'key', $v )` |
| `$order->get_status()`, `$order->update_status()` | `get_post_status( $order_id )` |
| `OrderUtil::is_order( $id )`, `OrderUtil::get_order_type( $id )` | `get_post_type( $id ) === 'shop_order'` |
| Raw SQL via the datastore or `wc_get_orders()` with `meta_query` | `$wpdb->posts` joins for orders |

```php
$order = wc_get_order( $order_id );
if ( ! $order instanceof WC_Order ) {
	return;
}
$order->update_meta_data( '_acme_tracking_ref', sanitize_text_field( $ref ) );
$order->save();
```

- Search with `wc_get_orders( array( 'status' => 'processing', 'limit' => 20, 'paginate' => true ) )`; use `return => 'ids'` when only ids are needed
- Admin screen id for orders: `wc_get_page_screen_id( 'shop-order' )`; compare it with `get_current_screen()->id` when adding meta boxes or enqueuing admin assets (the screen differs between HPOS and legacy storage)
- Meta boxes on orders: use `add_meta_box( ..., wc_get_page_screen_id( 'shop-order' ), ... )`; the callback receives a `WP_Post` (legacy) or a `WC_Order` (HPOS): normalize with `$order = $post_or_order instanceof WP_Post ? wc_get_order( $post_or_order->ID ) : $post_or_order;`
- Order list columns and bulk actions: the HPOS orders screen (`wc_get_page_screen_id( 'shop-order' )`) is not the legacy `edit.php?post_type=shop_order` list, so hooks tied to the legacy post list must be audited (see the HPOS recipe book) and the HPOS screen equivalents used.
- Synchronization (compatibility mode) between HPOS and posts tables exists for migration; code must not rely on legacy posts data being current. Never write to the posts tables directly
- Test with HPOS enabled (and disabled if you support legacy), using `wp wc hpos enable` through WP-CLI in the test environment (see the WC-CLI HPOS commands)

## 3. WC_Data CRUD

`WC_Product`, `WC_Order`, `WC_Order_Item`, `WC_Customer`, `WC_Coupon` extend `WC_Data`: getters/setters change in-memory state, `save()` persists through a data store and fires hooks.

```php
$product = wc_get_product( $product_id );
$product->set_regular_price( '19.90' );
$product->update_meta_data( '_acme_origin', 'FR' );
$product->save();

$customer = new WC_Customer( $user_id );
$customer->set_billing_phone( sanitize_text_field( $phone ) );
$customer->save();
```

- Use `wc_get_products()` / `WC_Product_Query` for lookups, with `limit`, `return => 'ids'` and `paginate`
- Money: treat prices as strings, use `wc_format_decimal()`, `wc_price()` for display (escaped by WooCommerce), `wc_get_price_decimals()`; never floats for totals
- Custom product types extend `WC_Product` (or a subclass) with a data store; register via `product_type_selector` and `woocommerce_product_class`
- Custom order item or data fields use the object meta API (`update_meta_data`) rather than new tables, unless the volume justifies one (then a custom table with its own datastore)
- Use `wc_get_logger()` with a `source` context instead of `error_log()`; never log payment data

## 4. Hooks You Will Use

| Need | Hook |
|------|------|
| Order created at checkout | `woocommerce_checkout_order_processed`, or block checkout: `woocommerce_store_api_checkout_order_processed` |
| Order status changes | `woocommerce_order_status_changed`, `woocommerce_order_status_{status}`, `woocommerce_payment_complete` |
| Cart totals and fees | `woocommerce_cart_calculate_fees`, `woocommerce_before_calculate_totals` |
| Product price filters | `woocommerce_product_get_price`, `woocommerce_get_price_html` |
| Add to cart validation | `woocommerce_add_to_cart_validation` |
| Emails | `woocommerce_email_classes`, `woocommerce_email_order_meta` |
| Payment gateways | `woocommerce_payment_gateways` |
| Shipping methods | `woocommerce_shipping_methods` |
| Settings tabs | `woocommerce_get_settings_pages`, `woocommerce_settings_tabs_array` |

Prefer filters and actions over template overrides; if you must override a template, use `wc_get_template()` with your own path and a `woocommerce_locate_template` filter rather than copying templates into the theme.

## 5. Store API and Cart / Checkout Blocks

The Cart and Checkout blocks render through the Store API (`wc/store/v1`), not through classic template hooks. Extend them with the Store API and the blocks extensibility layer.

**Add data to an endpoint** (server side, on `woocommerce_blocks_loaded`):

```php
use Automattic\WooCommerce\StoreApi\Schemas\V1\CartSchema;

add_action(
	'woocommerce_blocks_loaded',
	static function () {
		woocommerce_store_api_register_endpoint_data(
			array(
				'endpoint'        => CartSchema::IDENTIFIER,
				'namespace'       => 'acme_loyalty',
				'data_callback'   => static function () {
					return array( 'points' => 120 );
				},
				'schema_callback' => static function () {
					return array(
						'points' => array(
							'description' => __( 'Loyalty points', 'acme-loyalty' ),
							'type'        => 'integer',
							'readonly'    => true,
						),
					);
				},
				'schema_type'     => ARRAY_A,
			)
		);
	}
);
```

The data appears under `extensions.acme_loyalty` in the Cart response. Use `CheckoutSchema::IDENTIFIER` for the Checkout endpoint; `ExtendSchema::register_endpoint_data()` (obtained from the Store API container) is the underlying API.

**Update server state from the front end**: register an update callback with `woocommerce_store_api_register_update_callback()` (namespace plus callback) and call `extensionCartUpdate()` from `@woocommerce/blocks-checkout`.

**Render UI**: use slot-fills (for example `ExperimentalOrderMeta`, discount and totals slots) from `@woocommerce/blocks-checkout`, registered with `registerPlugin()` using the `woocommerce-checkout` scope; slots with an `Experimental` prefix may change, so isolate them and test on upgrades. For new inner blocks, register them with `block.json` and the checkout parent (`parent`/`ancestor`).

**Server-side integration**: implement `Automattic\WooCommerce\Blocks\Integrations\IntegrationInterface` (`get_name()`, `initialize()`, `get_script_handles()`, `get_editor_script_handles()`, `get_script_data()`) and register it on `woocommerce_blocks_cart_block_registration` / `woocommerce_blocks_checkout_block_registration` through `$integration_registry->register( new My_Integration() )`.

**Save checkout field values**: listen to `woocommerce_store_api_checkout_update_order_from_request` (receives `$order` and `$request`), validate and sanitize the extension data, then `$order->update_meta_data()`; the block checkout does not post classic form fields.

- Block checkout does not fire many classic hooks (`woocommerce_checkout_fields`, `woocommerce_after_order_notes`, ...): use Additional Checkout Fields (`woocommerce_register_additional_checkout_field()`) or the Store API extension
- Keep the Store API contract stable: namespaced data only, no changes to core keys
- Declare `cart_checkout_blocks` compatibility only after testing both blocks and the shortcode fallback

## 6. REST API (wc/v3) and Webhooks

- Core REST endpoints are under `wc/v3` (orders, products, customers, coupons, ...): authenticate external clients with API keys (consumer key/secret over HTTPS) or Application Passwords; scopes are read, write, read/write
- Extend with `woocommerce_rest_prepare_*` filters or register your own namespace (`acme/v1`) following the WordPress REST rules; use `wc_rest_check_post_permissions()` / `wc_rest_check_manager_permissions()` or an explicit capability in your `permission_callback`
- Webhooks: WooCommerce signs delivery with an HMAC-SHA256 base64 signature in `X-WC-Webhook-Signature` computed with the webhook secret over the raw body; as a receiver verify it with `hash_equals()` before processing
- Respond quickly to incoming gateway webhooks and process asynchronously (Action Scheduler: `as_enqueue_async_action()`, `as_schedule_single_action()`), with idempotency keys so replays are safe

## 7. Payment Gateways

- Extend `WC_Payment_Gateway`; implement `process_payment( $order_id )` returning `array( 'result' => 'success', 'redirect' => ... )`, `init_form_fields()` and `process_admin_options()`; register on `woocommerce_payment_gateways`
- For block checkout, also provide a payment method integration: extend `AbstractPaymentMethodType` (`Automattic\WooCommerce\Blocks\Payments\Integrations\AbstractPaymentMethodType`), register it on `woocommerce_blocks_payment_method_type_registration`, and register the client script with `registerPaymentMethod()` from `@woocommerce/blocks-registry`
- Never handle raw card data on your server; use the provider's hosted fields or redirect; PCI scope stays with the provider
- Re-compute amounts server-side from the order, never trust client totals; compare webhook amount and currency with the order before marking paid
- Verify webhook authenticity (provider signature, timestamp tolerance, `hash_equals()`), make handlers idempotent (check the order status/transaction id before `payment_complete()`), log with `wc_get_logger()` without secrets
- Store provider secrets in constants or encrypted options, never in autoloaded plain options exposed through REST
- Support refunds with `process_refund()` and declare it in `$this->supports`; declare `supports` for features you implement only

## 8. Admin and Settings

- Settings pages: extend `WC_Settings_Page` or use the Settings API fields (`woocommerce_admin_fields()`, `woocommerce_update_options()`) inside WooCommerce's tabs
- Capabilities: `manage_woocommerce` for settings and reports, `edit_shop_orders` / `edit_shop_order` (HPOS aware via `current_user_can( 'edit_shop_order', $id )`) for orders
- Do not add heavy queries to the orders list; use HPOS-aware filters and indexes

## 9. Performance

- Avoid loading all orders or products; paginate and use `return => 'ids'`
- Defer heavy work to Action Scheduler (bundled with WooCommerce) instead of WP-Cron for long jobs; chunk batches
- Cache computed values in transients keyed by cart hash or order id and invalidate on `woocommerce_update_product` / order status changes
- Load front-end assets only on shop, cart, checkout and account pages (`is_woocommerce()`, `is_cart()`, `is_checkout()`, `is_account_page()`), or when your block is present

## 10. Testing

| Surface | Setup |
|---------|-------|
| Static analysis | `php-stubs/woocommerce-stubs` 11.2.2 with PHPStan (`szepeviktor/phpstan-wordpress`); add it to `require-dev` and `scanDirectories` or `bootstrapFiles` as needed |
| Integration | `wp-env` with WooCommerce installed; `WP_UnitTestCase`; create fixtures with the CRUD API (`wc_create_order()`, `WC_Product_Simple`) in small helpers of your own |
| E2E | Playwright against `wp-env`; seed products through the `wc/v3` REST API or WP-CLI (`wp wc product create`), test classic and block checkout |

`.wp-env.json`:

```json
{
  "plugins": [
    ".",
    "https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip"
  ],
  "config": { "WP_DEBUG": true, "WP_DEBUG_LOG": true }
}
```

Pin a WooCommerce version in CI (for example the minimum you support and the latest) by replacing `latest-stable` with a versioned ZIP; HPOS and legacy storage are both worth a CI job when you declare compatibility.

```php
class Acme_Order_Test extends WP_UnitTestCase {

	public function test_tracking_ref_is_saved_on_order(): void {
		$order = wc_create_order();
		$order->update_meta_data( '_acme_tracking_ref', 'REF-1' );
		$order->save();

		$this->assertSame( 'REF-1', wc_get_order( $order->get_id() )->get_meta( '_acme_tracking_ref' ) );
	}
}
```

## Sources

- https://developer.woocommerce.com/docs/features/orders/high-performance-order-storage/recipe-book
- https://developer.woocommerce.com/docs/block-development/extensible-blocks/cart-and-checkout-blocks
- https://developer.woocommerce.com/docs/apis/store-api/extending-store-api/extend-store-api-add-data
- https://developer.woocommerce.com/docs/block-development/reference/slot-fills
- https://developer.woocommerce.com/docs/wc-cli/wc-cli-commands/wc-hpos
- https://developer.woocommerce.com/docs/ (REST API, payment gateway API and webhook guides; verify the exact page for your version)
- https://wordpress.org/plugins/woocommerce/ and https://api.wordpress.org/plugins/info/1.2/ (version 11.2.2, verified 2026-11-10)
- https://packagist.org/packages/php-stubs/woocommerce-stubs
