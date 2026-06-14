import { mount } from 'svelte';
// Polices auto-hébergées (bundlées par Vite, servies depuis 'self' → CSP-safe).
// Space Grotesk = display/UI, JetBrains Mono = IDs/points/code/TDD.
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/600.css';
import '@fontsource/jetbrains-mono/700.css';
import './app.css';
import './views.css';
import App from './App.svelte';

const app = mount(App, { target: document.getElementById('app') });

export default app;
