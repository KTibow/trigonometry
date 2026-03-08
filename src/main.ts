import { mount } from 'svelte';
import 'm3-svelte/etc/layer';
import './login/unfinishedwork/main.svelte';
import './app.css';
import App from './App.svelte';

mount(App, {
  target: document.body!,
});
