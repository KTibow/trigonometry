import { mount } from 'svelte';
import 'm3-svelte/etc/layer';
import './app.css';
import App from './App.svelte';

// import('./lib/tracked/verification.svelte');
// import('./home/auto/+main');
mount(App, {
  target: document.body!,
});
