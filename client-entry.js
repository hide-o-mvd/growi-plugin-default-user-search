// client-entry.tsx
const activate = () => {
    // DOM変化を監視
    const observer = new MutationObserver(() => {
        // 検索結果ページ (/ _search) でのみ実行
        if (!location.pathname.startsWith('/_search')) {
            return;
        }
        // フィルタ部要素を取得（要カスタマイズ）
        const filterArea = document.querySelector('.grw-search-control');
        if (!filterArea || filterArea.getAttribute('data-defaulted')) {
            return;
        }
        filterArea.setAttribute('data-defaulted', 'true');
        // 「/user下も含む」チェックボックスを探してONに
        const chk = filterArea.querySelector('input[name="includeUserHomepages"]');
        if (chk && !chk.checked) {
            chk.click();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
};
const deactivate = () => {
    // 必要に応じてクリーンアップ処理
};
if (window.pluginActivators == null) {
    window.pluginActivators = {};
}
window.pluginActivators['growi-plugin-default-user-search'] = { activate, deactivate };
export {};
//# sourceMappingURL=client-entry.js.map