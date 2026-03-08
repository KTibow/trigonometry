import { mount } from 'svelte';
import 'm3-svelte/etc/layer';
import './app.css';
import App from './App.svelte';

import('./login/unfinishedwork/main.svelte');
import('./home/auto/autocharger');
mount(App, {
  target: document.body!,
});
