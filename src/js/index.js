import { start } from './lib/mount.js';

// Компоненты регистрируют себя сами при импорте.
import './features/share.js';

window.CB = window.CB || {};
window.CB.version = '0.1.0';

start();
