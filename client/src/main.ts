import { mountApp } from './app/mountApp';
import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';

const el = document.querySelector<HTMLElement>('#app');
if (el) {
  mountApp(el);
}
