# Template: REST Endpoint

A custom REST route with a mandatory `permission_callback`, an `args` schema with validation and sanitization, `WP_Error` responses and a PHPUnit test. Targets the WordPress 7.1 line (PHP 7.4 minimum).

## Conventions

- Register on `rest_api_init` with a vendor namespace and version (`acme/v1`)
- `permission_callback` is required on every route; write routes never use `__return_true`
- `args` declare `type`, `required`, `validate_callback` and `sanitize_callback` (or `enum` / `format` / `minimum`)
- The controller maps request to a domain service call to a response; business rules live in the service
- Return `WP_REST_Response` for success and `WP_Error` (with a `status`) for failures
- Per-object authorization uses the id from the request (`current_user_can( 'edit_post', $id )`)
- Cookie-authenticated clients send the `X-WP-Nonce` header (`wp_rest` action); `@wordpress/api-fetch` adds it automatically

## Controller (src/Rest/Reports_Controller.php)

```php
<?php
declare( strict_types=1 );

namespace Acme\Reports\Rest;

use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

final class Reports_Controller {

	private const NAMESPACE = 'acme/v1';

	public function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			'/reports',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'can_read' ),
					'args'                => array(
						'per_page' => array(
							'type'              => 'integer',
							'default'           => 10,
							'minimum'           => 1,
							'maximum'           => 100,
							'sanitize_callback' => 'absint',
						),
					),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'can_create' ),
					'args'                => $this->create_args(),
				),
				'schema' => array( $this, 'get_item_schema' ),
			)
		);
	}

	/** @return array<string, array<string, mixed>> */
	private function create_args(): array {
		return array(
			'title'  => array(
				'type'              => 'string',
				'required'          => true,
				'minLength'         => 1,
				'maxLength'         => 200,
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => static function ( $value ): bool {
					return is_string( $value ) && '' !== trim( $value );
				},
			),
			'status' => array(
				'type'    => 'string',
				'enum'    => array( 'draft', 'publish' ),
				'default' => 'draft',
			),
		);
	}

	public function can_read(): bool {
		return current_user_can( 'read' );
	}

	public function can_create() {
		if ( ! current_user_can( 'publish_posts' ) ) {
			return new WP_Error(
				'acme_reports_forbidden',
				__( 'You are not allowed to create reports.', 'acme-reports' ),
				array( 'status' => rest_authorization_required_code() )
			);
		}
		return true;
	}

	public function get_items( WP_REST_Request $request ): WP_REST_Response {
		$query = new \WP_Query(
			array(
				'post_type'      => 'acme_report',
				'posts_per_page' => (int) $request['per_page'],
				'no_found_rows'  => true,
			)
		);

		$items = array_map( array( $this, 'prepare_item' ), $query->posts );

		return rest_ensure_response( $items );
	}

	/** @return WP_REST_Response|WP_Error */
	public function create_item( WP_REST_Request $request ) {
		$id = wp_insert_post(
			array(
				'post_type'   => 'acme_report',
				'post_title'  => $request['title'],
				'post_status' => $request['status'],
			),
			true
		);

		if ( is_wp_error( $id ) ) {
			$id->add_data( array( 'status' => 500 ) );
			return $id;
		}

		$response = new WP_REST_Response( $this->prepare_item( get_post( $id ) ), 201 );
		$response->header( 'Location', rest_url( self::NAMESPACE . '/reports/' . $id ) );

		return $response;
	}

	/** @return array<string, mixed> */
	private function prepare_item( \WP_Post $post ): array {
		return array(
			'id'     => $post->ID,
			'title'  => get_the_title( $post ),
			'status' => $post->post_status,
		);
	}

	/** @return array<string, mixed> */
	public function get_item_schema(): array {
		return array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'report',
			'type'       => 'object',
			'properties' => array(
				'id'     => array( 'type' => 'integer', 'readonly' => true ),
				'title'  => array( 'type' => 'string' ),
				'status' => array( 'type' => 'string', 'enum' => array( 'draft', 'publish' ) ),
			),
		);
	}
}
```

Notes:
- Without a `validate_callback`, REST validates each argument against its declared schema keywords (`type`, `enum`, `minimum`, `maximum`, `minLength`, `maxLength`, `format`) and returns a 400 on failure
- A custom `validate_callback` or `sanitize_callback` replaces that default handling for the argument: re-check the constraints you still need inside it, or use the callback only for rules the schema cannot express
- Never return fields the caller should not see (emails, tokens, internal paths); the response schema defines the contract
- Public read routes may use `'permission_callback' => '__return_true'` deliberately, with a comment; never for writes
- For heavy features extend `WP_REST_Controller` and implement `get_items_permissions_check()`, `create_item_permissions_check()`, `prepare_item_for_response()`

## Registration

```php
add_action( 'rest_api_init', array( new Acme\Reports\Rest\Reports_Controller(), 'register_routes' ) );
```

## Calling It from JavaScript

```js
import apiFetch from '@wordpress/api-fetch';

const report = await apiFetch( {
	path: '/acme/v1/reports',
	method: 'POST',
	data: { title: 'Q4', status: 'draft' },
} );
```

## Test (PHPUnit, integration)

```php
<?php
class Reports_Controller_Test extends WP_UnitTestCase {

	public function set_up(): void {
		parent::set_up();
		register_post_type( 'acme_report' );
		do_action( 'rest_api_init' );
	}

	public function test_anonymous_cannot_create(): void {
		wp_set_current_user( 0 );

		$request = new WP_REST_Request( 'POST', '/acme/v1/reports' );
		$request->set_body_params( array( 'title' => 'Q4' ) );

		$this->assertSame( 401, rest_do_request( $request )->get_status() );
	}

	public function test_subscriber_cannot_create(): void {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'subscriber' ) ) );

		$request = new WP_REST_Request( 'POST', '/acme/v1/reports' );
		$request->set_body_params( array( 'title' => 'Q4' ) );

		$this->assertSame( 403, rest_do_request( $request )->get_status() );
	}

	public function test_missing_title_is_rejected(): void {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );

		$response = rest_do_request( new WP_REST_Request( 'POST', '/acme/v1/reports' ) );

		$this->assertSame( 400, $response->get_status() );
	}

	public function test_editor_creates_and_title_is_sanitized(): void {
		wp_set_current_user( self::factory()->user->create( array( 'role' => 'editor' ) ) );

		$request = new WP_REST_Request( 'POST', '/acme/v1/reports' );
		$request->set_body_params( array( 'title' => '<b>Q4</b>' ) );
		$response = rest_do_request( $request );

		$this->assertSame( 201, $response->get_status() );
		$this->assertSame( 'Q4', $response->get_data()['title'] );
	}
}
```

Run: `npx wp-env run tests-cli --env-cwd=wp-content/plugins/acme-reports vendor/bin/phpunit --filter Reports_Controller_Test`.

## Checklist

- [ ] `register_rest_route()` on `rest_api_init`, vendor namespace and version
- [ ] `permission_callback` on every route; writes never `__return_true`; object-level capability where relevant
- [ ] `args` with `type`, `required`, validation and sanitization; response schema declared
- [ ] Errors are `WP_Error` with a `status`; success uses the right HTTP status (201 on create)
- [ ] No sensitive fields in responses
- [ ] Tests for anonymous (401), wrong role (403), invalid input (400) and success
