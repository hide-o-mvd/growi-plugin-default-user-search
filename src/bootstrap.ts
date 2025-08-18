import { findIncludeUserCheckbox } from './selectors';

const SESSION_FLAG = 'growi.includeUser.initialized';

/**
 * 初回だけ "/user 下も含む" を強制 ON にする。
 * ユーザーが手で OFF にした後は尊重するため、セッションフラグで1回限り。
 */
function tryCheckIncludeUserOnce(): boolean {
  if (sessionStorage.getItem(SESSION_FLAG) === '1') return true;

  const checkbox = findIncludeUserCheckbox();
  if (!checkbox) return false;

  if (!checkbox.checked) {
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  }

  sessionStorage.setItem(SESSION_FLAG, '1');
  return true;
}

/**
 * 検索結果UIの描画タイミングに依存しないよう MutationObserver で監視。
 * GROWI v7 はSPAなので、URL判定は控えめにし、見つかったら即停止。
 */
export function bootstrapObserver(): void {
  if (tryCheckIncludeUserOnce()) return;

  const obs = new MutationObserver(() => {
    if (tryCheckIncludeUserOnce()) {
      obs.disconnect();
    }
  });

  obs.observe(document.documentElement, { childList: true, subtree: true });
}
