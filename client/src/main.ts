import { mountOneWordApp } from './app/mountOneWordApp.js';
import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';

const el = document.querySelector<HTMLElement>('#app');
if (el) {
  mountOneWordApp(el);
}
