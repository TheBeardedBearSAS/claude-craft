# Template: Dynamic Block with Interactivity API

A block folder with `block.json` (apiVersion 3), an editor script, a server-rendered `render.php` and an optional Interactivity API view module. Blocks are registered all at once from a build manifest (recommended since WordPress 6.8). Targets the WordPress 7.1 line with `@wordpress/scripts` 37.1.0.

## Conventions

- One folder per block under `src/`, namespaced block name (`acme/report`), `textdomain` equal to the plugin slug
- Dynamic rendering in PHP (`render.php`) when output depends on server data; static `save()` only for markup that never changes server-side
- `render.php` escapes late and uses `get_block_wrapper_attributes()`
- Front-end interactivity with the Interactivity API (`viewScriptModule`), not jQuery
- Any change to saved markup or attributes needs a `deprecated` entry and a fixture
- Scaffold quickly with `npx @wordpress/create-block@latest report-block` (add `--template @wordpress/create-block-interactive-template` for an interactive block)

## Layout

```
src/report/
├── block.json
├── index.js        # registerBlockType + edit/save
├── edit.js
├── render.php
├── view.js         # Interactivity API store (script module)
├── style.scss      # Front end and editor
└── editor.scss     # Editor only
```

## block.json

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "acme/report",
  "version": "1.0.0",
  "title": "Report",
  "category": "widgets",
  "icon": "chart-bar",
  "description": "Displays a report with a toggleable details panel.",
  "textdomain": "acme-reports",
  "attributes": {
    "reportId": { "type": "integer", "default": 0 },
    "showDetails": { "type": "boolean", "default": false }
  },
  "supports": {
    "html": false,
    "align": [ "wide", "full" ],
    "interactivity": true,
    "color": { "background": true, "text": true }
  },
  "editorScript": "file:./index.js",
  "editorStyle": "file:./index.css",
  "style": "file:./style-index.css",
  "render": "file:./render.php",
  "viewScriptModule": "file:./view.js"
}
```

## Edit Component (edit.js)

```js
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, TextControl } from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
	const { reportId, showDetails } = attributes;

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'acme-reports' ) }>
					<TextControl
						type="number"
						label={ __( 'Report ID', 'acme-reports' ) }
						value={ reportId }
						onChange={ ( value ) => setAttributes( { reportId: parseInt( value, 10 ) || 0 } ) }
					/>
					<ToggleControl
						label={ __( 'Show details', 'acme-reports' ) }
						checked={ showDetails }
						onChange={ ( value ) => setAttributes( { showDetails: value } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<p { ...useBlockProps() }>
				{ __( 'Report preview (rendered on the server).', 'acme-reports' ) }
			</p>
		</>
	);
}
```

```js
// index.js: dynamic block, save returns null
import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => null,
} );
```

For a richer editor preview use `@wordpress/server-side-render` sparingly (it re-requests on every attribute change).

## Server Rendering (render.php)

Variables available: `$attributes` (array), `$content` (string, inner blocks), `$block` (`WP_Block`).

```php
<?php
/**
 * Render callback for acme/report.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$report_id = absint( $attributes['reportId'] ?? 0 );
$report    = $report_id ? get_post( $report_id ) : null;

if ( ! $report || 'acme_report' !== $report->post_type || ! current_user_can( 'read_post', $report->ID ) ) {
	return;
}

wp_interactivity_state(
	'acme/report',
	array( 'isOpen' => ! empty( $attributes['showDetails'] ) )
);
?>
<div
	<?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by core. ?>
	data-wp-interactive="acme/report"
	data-wp-context='{ "toggled": false }'
>
	<h3><?php echo esc_html( get_the_title( $report ) ); ?></h3>
	<button
		type="button"
		data-wp-on--click="actions.toggle"
		data-wp-bind--aria-expanded="context.toggled"
	>
		<?php esc_html_e( 'Toggle details', 'acme-reports' ); ?>
	</button>
	<div data-wp-bind--hidden="!context.toggled">
		<?php echo wp_kses_post( wpautop( $report->post_excerpt ) ); ?>
	</div>
</div>
```

## Interactivity API Store (view.js)

```js
import { store, getContext } from '@wordpress/interactivity';

store( 'acme/report', {
	actions: {
		toggle() {
			const context = getContext();
			context.toggled = ! context.toggled;
		},
	},
} );
```

`viewScriptModule` builds need `wp-scripts build --experimental-modules` unless the scaffold already sets it.

## Registration (plugin main file or `src/Blocks.php`)

```php
add_action(
	'init',
	static function () {
		wp_register_block_types_from_metadata_collection(
			__DIR__ . '/build',
			__DIR__ . '/build/blocks-manifest.php'
		);
	}
);
```

`package.json`:

```json
{
  "scripts": {
    "build": "wp-scripts build --blocks-manifest --experimental-modules",
    "start": "wp-scripts start --blocks-manifest --experimental-modules"
  }
}
```

`wp-scripts build-blocks-manifest` is the standalone command that produces `build/blocks-manifest.php`. For one block, `register_block_type( __DIR__ . '/build/report' )` still works.

## Deprecation (when saved markup or attributes change)

```js
const v1 = {
	attributes: { /* old attributes */ },
	save( { attributes } ) { /* old markup */ },
	migrate( attributes ) { return { ...attributes /* renamed fields */ }; },
};

registerBlockType( metadata.name, { edit: Edit, save, deprecated: [ v1 ] } );
```

Keep the old markup as a Jest fixture so validation keeps passing.

## Test (Jest)

```js
import { render, screen } from '@testing-library/react';
import Edit from '../edit';

test( 'edit renders the preview text', () => {
	render( <Edit attributes={ { reportId: 1, showDetails: false } } setAttributes={ () => {} } /> );
	expect( screen.getByText( /report preview/i ) ).toBeTruthy();
} );
```

Run with `npx wp-scripts test-unit-js`. Cover the front-end rendering in an integration test (`do_blocks( '<!-- wp:acme/report {"reportId":1} /-->' )`) and one Playwright journey.

## Checklist

- [ ] `block.json` has `apiVersion` 3, namespaced name, `textdomain`, typed attributes with defaults
- [ ] Dynamic output escaped late; wrapper from `get_block_wrapper_attributes()`
- [ ] Access to the data checked with a capability where the content is not public
- [ ] Interactivity API used for front-end behavior; no jQuery
- [ ] Registered via `wp_register_block_types_from_metadata_collection()` and a generated manifest
- [ ] Deprecations and fixtures present when markup changed
- [ ] Strings translatable; accessible markup (button, `aria-expanded`)
- [ ] Tests: Jest for edit/save, PHPUnit for `render.php`, Playwright for the journey
