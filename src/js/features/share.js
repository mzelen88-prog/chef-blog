import { register } from '../lib/mount.js';
import { h } from '../lib/dom.js';

// Ссылки шеринга. Иконки намеренно не используем — только текст,
// чтобы не тащить в бандл чужие товарные знаки.
const NETWORKS = [
  { label: 'Telegram',   href: (url, title) => `https://t.me/share/url?url=${url}&text=${title}` },
  { label: 'ВКонтакте',  href: (url, title) => `https://vk.com/share.php?url=${url}&title=${title}` },
  { label: 'WhatsApp',   href: (url, title) => `https://wa.me/?text=${title}%20${url}` },
];

const COPY_IDLE = 'Скопировать ссылку';

function mount(root) {
  const url = root.dataset.cbUrl || location.href;
  const title = root.dataset.cbTitle || document.title;
  const safeUrl = encodeURIComponent(url);
  const safeTitle = encodeURIComponent(title);

  const list = h('div', { class: 'cb-share__list' });

  if (typeof navigator.share === 'function') {
    const native = h('button', { type: 'button', class: 'cb-share__btn cb-share__btn--primary' }, 'Поделиться');
    native.addEventListener('click', () => {
      navigator.share({ title, url }).catch(() => {});
    });
    list.append(native);
  }

  for (const network of NETWORKS) {
    list.append(h('a', {
      class: 'cb-share__btn',
      href: network.href(safeUrl, safeTitle),
      target: '_blank',
      rel: 'noopener noreferrer',
    }, network.label));
  }

  const copy = h('button', { type: 'button', class: 'cb-share__btn' }, COPY_IDLE);
  let resetTimer;
  copy.addEventListener('click', async () => {
    clearTimeout(resetTimer);
    try {
      await navigator.clipboard.writeText(url);
      copy.textContent = 'Скопировано';
      copy.classList.add('cb-share__btn--done');
    } catch {
      copy.textContent = 'Не получилось';
    }
    resetTimer = setTimeout(() => {
      copy.textContent = COPY_IDLE;
      copy.classList.remove('cb-share__btn--done');
    }, 2000);
  });
  list.append(copy);

  root.append(list);
  root.classList.add('cb-share--ready');
}

register('[data-cb="share"]', mount);
