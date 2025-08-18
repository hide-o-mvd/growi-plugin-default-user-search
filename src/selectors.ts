export function findIncludeUserCheckbox(): HTMLInputElement | null {
  // 1) ラベルテキストに '/user' を含む候補（日本語/英語UI両対応）
  const labelCandidates = Array.from(document.querySelectorAll('label'))
    .filter(lab => {
      const t = lab.textContent?.trim() ?? '';
      return (
        t.includes('/user') ||                 // 共通: namespace を含む
        t.includes('下も含む') ||             // 日本語UI例
        t.toLowerCase().includes('include')   // 英語UIのフォールバック
      );
    });

  for (const lab of labelCandidates) {
    // label 内の checkbox
    const inLabel = lab.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    if (inLabel) return inLabel;

    // for 属性 → id による関連付け
    const forId = lab.getAttribute('for');
    if (forId) {
      const byFor = document.getElementById(forId) as HTMLInputElement | null;
      if (byFor && byFor.type === 'checkbox') return byFor;
    }
  }

  // 2) 属性フォールバック
  const fallback = document.querySelector(
    'input[type="checkbox"][name*="user" i], input[type="checkbox"][id*="user" i], input[type="checkbox"][data-testid*="user" i]'
  ) as HTMLInputElement | null;

  return fallback ?? null;
}
