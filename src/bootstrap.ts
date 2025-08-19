// ./src/bootstrap.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// 1. ルート判定
function isSearchPage(): boolean {
  const p = location.pathname;
  return p.includes('/_search') || p.includes('/search');
}

// 2. 「/user 下も含む」チェックを “ユーザー操作として” 実行（= onChange を確実に発火）
function clickIncludeUserIfFound(root: ParentNode): boolean {
  // ラベル文言は日英混在に備え、「/user」を手掛かりに広めに探索
  const nodes = Array.from(
    root.querySelectorAll<HTMLElement>('label, span, div, button')
  );

  for (const el of nodes) {
    const text = (el.textContent || '').trim();
    if (!text.includes('/user')) continue;

    // 直下の input[type=checkbox]
    const direct = el.querySelector<HTMLInputElement>('input[type="checkbox"]');
    if (direct) {
      if (!direct.checked) direct.click();
      return true;
    }

    // 兄弟にチェックボックスがあるケース
    const prev = el.previousElementSibling as HTMLInputElement | null;
    if (prev?.matches?.('input[type="checkbox"]')) {
      if (!prev.checked) prev.click();
      return true;
    }
    const next = el.nextElementSibling as HTMLInputElement | null;
    if (next?.matches?.('input[type="checkbox"]')) {
      if (!next.checked) next.click();
      return true;
    }

    // label[for] → id で input を辿る
    const forId = (el as HTMLLabelElement).htmlFor;
    if (forId) {
      const byId = root.querySelector<HTMLInputElement>(`#${CSS.escape(forId)}`);
      if (byId?.type === 'checkbox') {
        if (!byId.checked) byId.click();
        return true;
      }
    }
  }
  return false;
}

// 3. フォールバック：URL クエリから `-prefix:/user/` を削除して即時反映
function removeUserExcludeFromQuery(): boolean {
  const url = new URL(location.href);
  const key = url.searchParams.has('q') ? 'q'
           : url.searchParams.has('query') ? 'query'
           : null;
  if (!key) return false;

  const q = url.searchParams.get(key) || '';
  if (!q) return false;

  const replaced = q.replace(/\s*-prefix:\/user\/?/g, ' ').replace(/\s{2,}/g, ' ').trim();
  if (replaced !== q) {
    url.searchParams.set(key, replaced);
    history.replaceState({}, '', url.toString());
    // ルーティングに再評価させる
    window.dispatchEvent(new Event('popstate'));
    return true;
  }
  return false;
}

// 4. 1 回だけ適用するためのフラグ
const APPLIED_FLAG = 'gp_incuser__applied';

function applyOnce(): void {
  if (!isSearchPage()) return;

  // 同一ページ内での多重適用防止
  if ((document.body as any)[APPLIED_FLAG]) return;
  (document.body as any)[APPLIED_FLAG] = true;

  // 即時試行（描画済みならここで終わる）
  if (clickIncludeUserIfFound(document)) return;

  // 遅延描画に備えて監視
  const mo = new MutationObserver((_muts, obs) => {
    if (clickIncludeUserIfFound(document)) {
      obs.disconnect();
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // UI が見つからないケースでも効かせる “最後の砦”
  removeUserExcludeFromQuery();
}

// 5. SPA ルーティングに追随（popstate / pushState）
function patchPushStateOnce(): void {
  const hist = window.history as any;
  if (hist.__gp_patched) return;
  const origPush = hist.pushState;
  hist.pushState = function (...args: any[]) {
    const ret = origPush.apply(this, args);
    window.dispatchEvent(new Event('pushstate'));
    return ret;
  };
  hist.__gp_patched = true;
}

export function bootstrapObserver(): void {
  patchPushStateOnce();

  const onRoute = () => {
    // ページ遷移の度に再適用できるようフラグをクリア
    (document.body as any)[APPLIED_FLAG] = false;
    applyOnce();
  };

  // 初回
  applyOnce();

  // ルーティングイベント
  window.addEventListener('popstate', onRoute);
  window.addEventListener('pushstate', onRoute);
}
