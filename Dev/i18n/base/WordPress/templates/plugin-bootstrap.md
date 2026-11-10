# Template: Plugin Bootstrap

A minimal, safe plugin skeleton: header, direct-access guard, Composer autoload, a bootstrap class on `plugins_loaded`, activation, deactivation and uninstall. Targets the WordPress 7.1 line; PHP 7.4 minimum (8.3+ recommended).

## Conventions

- The main file contains the header and the bootstrap only; features live in classes under `src/`
- One namespace (`Acme\Reports`) and one prefix (`acme_reports_`) for every global
- Text domain equals the plugin slug; `Domain Path` points to `/languages`
- `Requires at least` and `Requires PHP` reflect the versions in the CI matrix; `Requires Plugins` lists hard dependencies by WordPress.org slug
- Activation and deactivation are idempotent; data removal lives in `uninstall.php`

## Main File (acme-reports.php)

```php
<?php
/**
 * Plugin Name:       Acme Reports
 * Plugin URI:        https://example.com/acme-reports
 * Description:       Reports and dashboards for Acme.
 * Version:           1.0.0
 * Requires at least: 6.6
 * Requires PHP:      7.4
 * Requires Plugins:  {{REQUIRED_PLUGIN_SLUG}}
 * Author:            Acme
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       acme-reports
 * Domain Path:       /languages
 *
 * @package Acme\Reports
 */

defined( 'ABSPATH' ) || exit;

define( 'ACME_REPORTS_VERSION', '1.0.0' );
define( 'ACME_REPORTS_FILE', __FILE__ );
define( 'ACME_REPORTS_DIR', plugin_dir_path( __FILE__ ) );
define( 'ACME_REPORTS_URL', plugin_dir_url( __FILE__ ) );

if ( ! is_readable( ACME_REPORTS_DIR . 'vendor/autoload.php' ) ) {
	return;
}
require_once ACME_REPORTS_DIR . 'vendor/autoload.php';

register_activation_hook( __FILE__, array( Acme\Reports\Lifecycle::class, 'activate' ) );
register_deactivation_hook( __FILE__, array( Acme\Reports\Lifecycle::class, 'deactivate' ) );

add_action( 'plugins_loaded', array( new Acme\Reports\Plugin(), 'boot' ) );
```

Remove the `Requires Plugins` line when there is no dependency.

## composer.json

```json
{
  "name": "acme/acme-reports",
  "type": "wordpress-plugin",
  "license": "GPL-2.0-or-later",
  "require": { "php": ">=7.4" },
  "autoload": { "psr-4": { "Acme\\Reports\\": "src/" } }
}
```

Ship `vendor/` in the release ZIP built with `composer install --no-dev --optimize-autoloader`.

## Bootstrap Class (src/Plugin.php)

```php
<?php
declare( strict_types=1 );

namespace Acme\Reports;

defined( 'ABSPATH' ) || exit;

final class Plugin {

	public function boot(): void {
		add_action( 'init', array( $this, 'register_content_types' ) );
		add_action( 'init', array( $this, 'register_blocks' ) );
		add_action( 'rest_api_init', array( new Rest\Reports_Controller(), 'register_routes' ) );

		if ( is_admin() ) {
			( new Admin\Settings_Page() )->register();
		}

		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			\WP_CLI::add_command( 'acme reports', Cli\Reports_Command::class );
		}
	}

	public function register_content_types(): void {
		register_post_type(
			'acme_report',
			array(
				'label'        => __( 'Reports', 'acme-reports' ),
				'public'       => false,
				'show_ui'      => true,
				'show_in_rest' => true,
				'supports'     => array( 'title', 'editor', 'excerpt' ),
				'capability_type' => 'post',
			)
		);
	}

	public function register_blocks(): void {
		wp_register_block_types_from_metadata_collection(
			ACME_REPORTS_DIR . 'build',
			ACME_REPORTS_DIR . 'build/blocks-manifest.php'
		);
	}
}
```

If the plugin supports WordPress below 6.8, fall back to `register_block_type( ACME_REPORTS_DIR . 'build/<block>' )`. Since WordPress 4.6, translations of plugins hosted on WordPress.org load automatically; call `load_plugin_textdomain()` on `init` only for translations bundled outside WordPress.org.

## Lifecycle (src/Lifecycle.php)

```php
<?php
declare( strict_types=1 );

namespace Acme\Reports;

defined( 'ABSPATH' ) || exit;

final class Lifecycle {

	private const DB_VERSION = '1';

	public static function activate(): void {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$table   = $wpdb->prefix . 'acme_reports_log';
		$charset = $wpdb->get_charset_collate();

		dbDelta(
			"CREATE TABLE {$table} (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				report_id bigint(20) unsigned NOT NULL,
				created_at datetime NOT NULL,
				PRIMARY KEY  (id),
				KEY report_id (report_id)
			) {$charset};"
		);

		update_option( 'acme_reports_db_version', self::DB_VERSION, false );

		if ( ! wp_next_scheduled( 'acme_reports_daily' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'acme_reports_daily' );
		}
	}

	public static function deactivate(): void {
		wp_clear_scheduled_hook( 'acme_reports_daily' );
		flush_rewrite_rules();
	}
}
```

`dbDelta()` is strict about formatting (two spaces after `PRIMARY KEY`, each field on its own line). Register post types before `flush_rewrite_rules()` runs on activation if the plugin adds rewrite rules.

## Uninstall (uninstall.php)

```php
<?php
// Runs only when WordPress deletes the plugin from the admin or via WP-CLI.
defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

global $wpdb;

delete_option( 'acme_reports_settings' );
delete_option( 'acme_reports_db_version' );
$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}acme_reports_log" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery,WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name built from the trusted prefix.
wp_clear_scheduled_hook( 'acme_reports_daily' );
```

For multisite, loop over `get_sites()` with `switch_to_blog()` / `restore_current_blog()` and delete network options with `delete_site_option()`.

## Test (PHPUnit, integration)

```php
class Lifecycle_Test extends WP_UnitTestCase {

	public function test_activate_records_db_version_and_schedules_cron(): void {
		Acme\Reports\Lifecycle::activate();

		$this->assertSame( '1', get_option( 'acme_reports_db_version' ) );
		$this->assertNotFalse( wp_next_scheduled( 'acme_reports_daily' ) );
	}

	public function test_deactivate_clears_cron(): void {
		Acme\Reports\Lifecycle::activate();
		Acme\Reports\Lifecycle::deactivate();

		$this->assertFalse( wp_next_scheduled( 'acme_reports_daily' ) );
	}
}
```

The WordPress test suite turns `CREATE TABLE` into temporary tables during tests, so assert the table through behavior (insert and read a row via your repository class) rather than `SHOW TABLES`.

## Checklist

- [ ] Header complete: `Plugin Name`, `Version`, `Requires at least`, `Requires PHP`, `Text Domain`, `Domain Path`, `License` (and `Requires Plugins` if dependent)
- [ ] `defined( 'ABSPATH' ) || exit;` in every directly reachable file
- [ ] Unique namespace and prefix; PSR-4 autoload
- [ ] Bootstrap on `plugins_loaded`; hooks registered in classes, not at file scope
- [ ] Activation and deactivation idempotent; `uninstall.php` removes all plugin data
- [ ] Database changes through `dbDelta()` with a version option
- [ ] Tests for lifecycle routines
