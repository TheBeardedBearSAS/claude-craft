<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  lang: string
  t: (key: string) => string
}>()

const accountBadge = ref('acc: personal')
const accountClass = ref('purple')
const ctxBadge = ref('ctx: 12%')
const ctxClass = ref('green')
const historyHtml = ref('')
const typingText = ref('')
const showCursor = ref(true)

let animationTimer: ReturnType<typeof setTimeout> | null = null
let cursorTimer: ReturnType<typeof setInterval> | null = null

const sequence = [
  {
    text: 'account list',
    output: 'Available accounts:<br>* <span style="color:white">personal</span> (active)<br>&nbsp; <span style="color:#64748b">work-profile</span>',
    action: () => {},
  },
  {
    text: 'account switch work-profile',
    output: '<span style="color:#4ade80">\u2713</span> Switched to account: <span style="color:white;font-weight:700">work-profile</span>',
    action: () => {
      accountBadge.value = 'acc: work'
      accountClass.value = 'orange'
    },
  },
  {
    text: '/common:audit',
    output: '<span style="color:#60a5fa">\u2139</span> Running pre-flight checks...<br><span style="color:#4ade80">\u2713</span> Context usage within limits',
    action: () => {
      ctxBadge.value = 'ctx: 15%'
      ctxClass.value = 'yellow'
    },
  },
]

function reset() {
  accountBadge.value = 'acc: personal'
  accountClass.value = 'purple'
  ctxBadge.value = 'ctx: 12%'
  ctxClass.value = 'green'
  historyHtml.value = ''
  typingText.value = ''
}

function runSequence() {
  let stepIdx = 0
  let charIdx = 0
  let currentText = ''

  function typeNext() {
    if (stepIdx === 0 && charIdx === 0) reset()

    const step = sequence[stepIdx]
    if (charIdx < step.text.length) {
      currentText += step.text.charAt(charIdx)
      typingText.value = currentText
      charIdx++
      animationTimer = setTimeout(typeNext, 30 + Math.random() * 40)
    } else {
      animationTimer = setTimeout(() => {
        historyHtml.value += `<div style="margin-bottom:0.5rem;"><div style="display:flex;align-items:center;margin-bottom:0.25rem;"><span style="color:#4ade80;margin-right:0.5rem;">\u279c</span><span style="color:white;margin-right:0.25rem;">claude</span><span style="color:#e2e8f0">${step.text}</span></div><div style="color:#94a3b8;font-size:0.75rem;">${step.output}</div></div>`
        step.action()
        currentText = ''
        typingText.value = ''
        charIdx = 0
        stepIdx++
        if (stepIdx >= sequence.length) {
          animationTimer = setTimeout(() => {
            stepIdx = 0
            runSequence()
          }, 4000)
        } else {
          animationTimer = setTimeout(typeNext, 1000)
        }
      }, 400)
    }
  }

  animationTimer = setTimeout(typeNext, 1000)
}

onMounted(() => {
  runSequence()
  cursorTimer = setInterval(() => {
    showCursor.value = !showCursor.value
  }, 530)
})

onUnmounted(() => {
  if (animationTimer) clearTimeout(animationTimer)
  if (cursorTimer) clearInterval(cursorTimer)
})

const badgeColors: Record<string, { bg: string; text: string; border: string }> = {
  purple: { bg: 'rgba(88,28,135,0.3)', text: '#c4b5fd', border: 'rgba(139,92,246,0.2)' },
  orange: { bg: 'rgba(124,45,18,0.3)', text: '#fdba74', border: 'rgba(249,115,22,0.2)' },
  green: { bg: 'rgba(20,83,45,0.3)', text: '#86efac', border: 'rgba(34,197,94,0.2)' },
  yellow: { bg: 'rgba(113,63,18,0.3)', text: '#fde047', border: 'rgba(234,179,8,0.2)' },
}
</script>

<template>
  <div style="background: rgba(30,41,59,0.5); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 0.75rem;">
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; margin-bottom: 0.5rem; color: #64748b;">{{ t('term_preview_label') }}</div>
    <div style="background: rgba(0,0,0,0.8); border-radius: 0.5rem; padding: 1.25rem; font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; line-height: 1.6; min-height: 220px; display: flex; flex-direction: column; position: relative; overflow: hidden;">
      <!-- Status Bar -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.75rem;">
        <span style="color: #a78bfa; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          claude-craft
        </span>
        <span style="background: rgba(29,78,216,0.3); color: #93c5fd; padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; border: 1px solid rgba(59,130,246,0.2);">git:main</span>
        <span :style="{ background: badgeColors[ctxClass].bg, color: badgeColors[ctxClass].text, padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', border: '1px solid ' + badgeColors[ctxClass].border, transition: 'all 0.3s' }">{{ ctxBadge }}</span>
        <span :style="{ background: badgeColors[accountClass].bg, color: badgeColors[accountClass].text, padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', border: '1px solid ' + badgeColors[accountClass].border, transition: 'all 0.3s' }">{{ accountBadge }}</span>
      </div>
      <!-- History -->
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end;">
        <div v-html="historyHtml" style="color: #94a3b8; margin-bottom: 0.5rem;"></div>
        <!-- Typing line -->
        <div style="color: #cbd5e1; display: flex; align-items: center;">
          <span style="color: #4ade80; margin-right: 0.5rem;">&raquo;</span>
          <span style="color: white; margin-right: 0.25rem;">claude</span>
          <span style="color: #e2e8f0;">{{ typingText }}</span>
          <span :style="{ display: 'inline-block', width: '8px', height: '15px', background: '#a78bfa', verticalAlign: 'middle', marginLeft: '2px', opacity: showCursor ? 1 : 0 }"></span>
        </div>
      </div>
    </div>
  </div>
</template>
