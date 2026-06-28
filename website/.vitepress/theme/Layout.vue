<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import LandingPage from './LandingPage.vue'
import { onMounted, onUnmounted } from 'vue'

const { frontmatter } = useData()

// A11y fix for VitePress 1.6.4: a collapsible sidebar group header renders its toggle
// caret as a nested `role="button"` (+tabindex) inside the already-button `.item`,
// tripping axe's `nested-interactive` rule (WCAG 4.1.2 Name, Role, Value). The outer
// `.item` already carries the button role and keyboard handling, so the caret is purely
// decorative — strip its redundant interactive semantics. Scoped observer re-applies it
// across client-side navigation / sidebar re-renders at negligible cost.
let observer: MutationObserver | undefined

function dedupeSidebarCarets() {
  if (typeof document === 'undefined') return
  document.querySelectorAll('.VPSidebarItem .caret[role="button"]').forEach((el) => {
    el.removeAttribute('role')
    el.removeAttribute('tabindex')
    el.setAttribute('aria-hidden', 'true')
  })
}

onMounted(() => {
  dedupeSidebarCarets()
  const sidebar = document.querySelector('.VPSidebar')
  if (sidebar) {
    observer = new MutationObserver(() => dedupeSidebarCarets())
    observer.observe(sidebar, { childList: true, subtree: true })
  }
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <LandingPage v-if="frontmatter.layout === 'landing'" />
  <DefaultTheme.Layout v-else />
</template>
