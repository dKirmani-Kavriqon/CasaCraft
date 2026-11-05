/*
  Enquiry list: a lightweight bag that ends in a message to the workshop instead of a checkout.
  Stored per browser in localStorage. Every read and write is guarded so the page works without it.
*/

type Line = { slug: string; qty: number };
type CatalogEntry = { name: string; variant: string; price: number; url: string; thumb: string };

const KEY = 'casacraft:enquiry:v1';
const NOTE_KEY = 'casacraft:enquiry-note:v1';
const MAX_QTY = 12;

const catalog: Record<string, CatalogEntry> = JSON.parse(document.getElementById('catalog-data')?.textContent || '{}');
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

function load(): Line[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((l) => l && catalog[l.slug] && l.qty > 0) : [];
  } catch {
    return [];
  }
}
function save(lines: Line[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* storage unavailable: the list still works for this page view */
  }
}

let lines = load();
let lastRemoved: { line: Line; index: number } | null = null;
let undoTimer = 0;

const dialog = document.querySelector<HTMLDialogElement>('[data-enquiry]');
const list = document.querySelector<HTMLUListElement>('[data-enquiry-items]');
const tpl = document.getElementById('enquiry-item') as HTMLTemplateElement | null;
const empty = document.querySelector<HTMLElement>('[data-enquiry-empty]');
const foot = document.querySelector<HTMLElement>('[data-enquiry-foot]');
const totalEl = document.querySelector<HTMLElement>('[data-enquiry-total]');
const note = document.querySelector<HTMLTextAreaElement>('[data-enquiry-note]');
const undo = document.querySelector<HTMLElement>('[data-enquiry-undo]');
const undoText = document.querySelector<HTMLElement>('[data-enquiry-undo-text]');
const hint = document.querySelector<HTMLElement>('[data-enquiry-hint]');

const count = () => lines.reduce((n, l) => n + l.qty, 0);
const total = () => lines.reduce((n, l) => n + l.qty * catalog[l.slug].price, 0);

function renderCount(bump = false) {
  const n = count();
  document.querySelectorAll<HTMLElement>('[data-enquiry-count]').forEach((el) => {
    el.textContent = String(n);
    el.classList.toggle('is-empty', n === 0);
    if (bump && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }],
        { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
    }
  });
  document.querySelectorAll<HTMLElement>('[data-enquiry-count-label]').forEach((el) => {
    el.textContent = n === 0 ? ', no pieces' : n === 1 ? ', 1 piece' : `, ${n} pieces`;
  });
}

function render() {
  renderCount();
  if (!list || !tpl) return;
  list.replaceChildren(
    ...lines.map((line) => {
      const item = catalog[line.slug];
      const node = tpl.content.firstElementChild!.cloneNode(true) as HTMLLIElement;
      node.querySelectorAll<HTMLAnchorElement>('[data-href]').forEach((a) => (a.href = item.url));
      const img = node.querySelector<HTMLImageElement>('[data-img]')!;
      img.src = item.thumb;
      node.querySelector('[data-name]')!.textContent = item.name;
      node.querySelector('[data-variant]')!.textContent = item.variant;
      node.querySelector('[data-price]')!.textContent = inr.format(item.price * line.qty);
      node.querySelector('[data-qty]')!.textContent = String(line.qty);
      node.querySelector('[role="group"]')!.setAttribute('aria-label', `Quantity of ${item.name}, ${item.variant}`);
      const dec = node.querySelector<HTMLButtonElement>('[data-dec]')!;
      const inc = node.querySelector<HTMLButtonElement>('[data-inc]')!;
      dec.disabled = line.qty <= 1;
      inc.disabled = line.qty >= MAX_QTY;
      dec.addEventListener('click', () => setQty(line.slug, line.qty - 1));
      inc.addEventListener('click', () => setQty(line.slug, line.qty + 1));
      const remove = node.querySelector<HTMLButtonElement>('[data-remove]')!;
      remove.setAttribute('aria-label', `Remove ${item.name}, ${item.variant}`);
      remove.addEventListener('click', () => removeLine(line.slug));
      return node;
    }),
  );
  const isEmpty = lines.length === 0;
  if (empty) empty.hidden = !isEmpty;
  if (foot) foot.hidden = isEmpty;
  if (totalEl) totalEl.textContent = inr.format(total());
  updateLinks();
}

function setQty(slug: string, qty: number) {
  const line = lines.find((l) => l.slug === slug);
  if (!line) return;
  const dir = qty > line.qty ? 'inc' : 'dec';
  line.qty = Math.max(1, Math.min(MAX_QTY, qty));
  save(lines);
  render();
  // Re-rendering replaces the row, so keep keyboard focus on the stepper that was pressed.
  const row = list?.children[lines.indexOf(line)];
  const same = row?.querySelector<HTMLButtonElement>(`[data-${dir}]`);
  const other = row?.querySelector<HTMLButtonElement>(`[data-${dir === 'inc' ? 'dec' : 'inc'}]`);
  (same && !same.disabled ? same : other)?.focus();
}

function removeLine(slug: string) {
  const index = lines.findIndex((l) => l.slug === slug);
  if (index < 0) return;
  lastRemoved = { line: lines[index], index };
  lines.splice(index, 1);
  save(lines);
  render();
  if (undo && undoText) {
    undoText.textContent = `Removed ${catalog[slug].name}.`;
    undo.hidden = false;
    clearTimeout(undoTimer);
    undoTimer = window.setTimeout(() => (undo.hidden = true), 6000);
  }
}

document.querySelector('[data-enquiry-undo-btn]')?.addEventListener('click', () => {
  if (!lastRemoved) return;
  lines.splice(lastRemoved.index, 0, lastRemoved.line);
  lastRemoved = null;
  save(lines);
  render();
  if (undo) undo.hidden = true;
});

export function addToEnquiry(slug: string, qty = 1) {
  if (!catalog[slug]) return;
  const line = lines.find((l) => l.slug === slug);
  if (line) line.qty = Math.min(MAX_QTY, line.qty + qty);
  else lines.push({ slug, qty });
  save(lines);
  render();
  renderCount(true);
  const live = document.querySelector('[data-announce]');
  if (live) {
    const n = count();
    live.textContent = `Added ${catalog[slug].name}, ${catalog[slug].variant}. Your enquiry has ${n} ${n === 1 ? 'piece' : 'pieces'}.`;
  }
}

/* ---------- Message ---------- */
function message() {
  const rows = lines.map((l) => {
    const item = catalog[l.slug];
    return `• ${l.qty} × ${item.name}, ${item.variant} (${inr.format(item.price)} each)`;
  });
  const text = [
    'Hello Casa Craft, I would like to ask about these pieces:',
    '',
    ...rows,
    '',
    `Estimated total: ${inr.format(total())}`,
  ];
  const n = note?.value.trim();
  if (n) text.push('', `Note: ${n}`);
  return text.join('\n');
}

function updateLinks() {
  const wa = document.querySelector<HTMLAnchorElement>('[data-enquiry-send="whatsapp"]');
  if (wa) {
    const base = wa.href.split('?')[0];
    wa.href = `${base}?text=${encodeURIComponent(message())}`;
  }
}

async function copy(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(message());
    return true;
  } catch {
    return false;
  }
}

document.querySelector('[data-enquiry-send="instagram"]')?.addEventListener('click', async () => {
  const ok = await copy();
  if (hint) hint.textContent = ok ? 'Copied. Paste it into the Instagram chat that just opened.' : 'Instagram is opening. Use "Copy enquiry text" if the message is not in your clipboard.';
});

document.querySelector('[data-enquiry-copy]')?.addEventListener('click', async () => {
  const label = document.querySelector<HTMLElement>('[data-enquiry-copy-label]');
  const ok = await copy();
  if (label) {
    label.textContent = ok ? 'Copied' : 'Copy failed. Select and copy the list manually.';
    setTimeout(() => (label.textContent = 'Copy enquiry text'), 2400);
  }
});

if (note) {
  try {
    note.value = localStorage.getItem(NOTE_KEY) || '';
  } catch {}
  note.addEventListener('input', () => {
    try {
      localStorage.setItem(NOTE_KEY, note.value);
    } catch {}
    updateLinks();
  });
}

/* ---------- Drawer open and close ---------- */
export function openEnquiry() {
  if (!dialog || dialog.open) return;
  dialog.showModal();
  document.documentElement.style.overflow = 'hidden';
}
function closeEnquiry() {
  if (!dialog?.open) return;
  const finish = () => {
    dialog.classList.remove('is-closing');
    dialog.close();
    document.documentElement.style.overflow = '';
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return finish();
  dialog.classList.add('is-closing');
  dialog.addEventListener('animationend', finish, { once: true });
}

document.querySelectorAll('[data-enquiry-open]').forEach((b) => b.addEventListener('click', openEnquiry));
document.querySelector('[data-enquiry-close]')?.addEventListener('click', closeEnquiry);
dialog?.addEventListener('cancel', (e) => {
  e.preventDefault();
  closeEnquiry();
});
dialog?.addEventListener('click', (e) => {
  if (e.target === dialog) closeEnquiry();
});

window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    lines = load();
    render();
  }
});

render();
