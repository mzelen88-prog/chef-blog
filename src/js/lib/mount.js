// Регистрация компонентов и монтирование по мере появления узлов в DOM.
// Тильда рендерит блоки лениво, поэтому одного DOMContentLoaded мало.

const MOUNTED = '__cbMounted';
const registry = [];
let started = false;
let queued = false;

export function register(selector, mount) {
  registry.push({ selector, mount });
  if (started) schedule();
}

function mountIn(root) {
  for (const { selector, mount } of registry) {
    const nodes = [];
    if (root.nodeType === 1 && root.matches(selector)) nodes.push(root);
    if (root.querySelectorAll) nodes.push(...root.querySelectorAll(selector));
    for (const node of nodes) {
      if (node[MOUNTED]) continue;
      node[MOUNTED] = true;
      try {
        mount(node);
      } catch (err) {
        console.error('[cb] компонент не смонтировался:', selector, err);
      }
    }
  }
}

function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    mountIn(document);
  });
}

export function start() {
  if (started) return;
  started = true;

  const run = () => {
    mountIn(document);
    new MutationObserver((records) => {
      for (const record of records) {
        if (record.addedNodes.length) {
          schedule();
          return;
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}
