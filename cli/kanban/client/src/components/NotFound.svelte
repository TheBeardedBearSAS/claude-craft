<script>
  import { route } from '../lib/router.svelte.js';
  import { t } from '../lib/i18n/index.svelte.js';
</script>

<div class="empty not-found">
  <h2>{t('app.notFound.title')}</h2>
  <p>{t('app.notFound.body', { path: route.pathname })}</p>
  <a class="btn btn-primary" href="#/kanban">{t('app.notFound.back')}</a>
</div>
