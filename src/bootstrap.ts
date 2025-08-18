// src/bootstrap.ts
const SESSION_FLAG = 'growi.includeUser.initialized';

function findIncludeUserCheckbox(): { checkbox: HTMLInputElement, label?: HTMLLabelElement } | null {
  // 1) ラベルのテキストから候補を拾う
  const labels = Array.from(document.querySelectorAll('label')) as HTMLLabelElement[];
  const label = labels.find(lab => {
    const t = lab.textContent?.trim() ?? '';
    return t.includes('/user') || t.includes('下も含む') || t.toLowerCase().includes('include');
  });

  let checkbox: HTMLInputElement | null = null;

  if (label) {
    const inLabel = label.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    if (inLabel) checkbox = inLabel;
    if (!checkbox) {
      const forId = label.getAttribute('for');
      if (forId) {
        const byFor = document.getElementById(forId) as HTMLInputElement | null;
        if (byFor && byFor.type === 'checkbox') checkbox = byFor;
      }
    }
    if (checkbox) return { checkbox, label };
  }

  // 2) 属性フォールバック
  checkbox = document.querySelector(
    'input[type="checkbox"][name*="user" i], input[type="checkbox"][id*="user" i], input[type="checkbox"][data-testid*="user" i]'
  ) as HTMLInputElement | null;

  return checkbox ? { checkbox } : null;
}

/** “ユーザー操作に近い”手順でONにする */
function turnOnBySimulatedUserAction(checkbox: HTMLInputElement, label?: HTMLLabelElement): void {
  if (checkbox.checked) return;          // 既にONなら何もしない

  // 1) ラベルのクリックを優先（UIがlabelで制御されている可能性）
  (label ?? checkbox).click();           // element.click(): クリックイベントを発火（isTrusted=false） [2](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click)

  // 2) それでも未反映のときのフォールバック（ReactのonChange対応）
  if (!checkbox.checked) {
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('input',  { bubbles: true }));  // Reactはinput/changeを監視するケースあり [1](https://legacy.reactjs.org/docs/events.html)
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 3) さらに保険：親フォームがあれば“ボタンを押した扱い”で送信
  const form = checkbox.closest('form') as HTMLFormElement | null;
  if (form && typeof (form as any).requestSubmit === 'function') {
    // 状態反映とdiff→再検索の内部処理にワンクッション
    setTimeout(() => form.requestSubmit(), 0);  // HTMLFormElement.requestSubmit() [3](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/requestSubmit)
  }
}

function applyOnce(): boolean {
  if (sessionStorage.getItem(SESSION_FLAG) === '1') return true;

  const found = findIncludeUserCheckbox();
  if (!found) return false;

  // Reactのハンドラ取付完了を待つ（2フレーム遅延）
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      turnOnBySimulatedUserAction(found.checkbox, found.label ?? undefined);
      sessionStorage.setItem(SESSION_FLAG, '1');
    });
  });

  return true;
}

export function bootstrapObserver(): void {
  if (applyOnce()) return;

  const obs = new MutationObserver(() => {
    if (applyOnce()) obs.disconnect();
  });

  obs.observe(document.documentElement, { childList: true, subtree: true });
}
