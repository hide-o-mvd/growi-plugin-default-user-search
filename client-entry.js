import config from './package.json';
import { bootstrapObserver } from './src/bootstrap';
// SPA 遷移にも対応：常にブートするだけでOK（内部で1回だけ適用）
const activate = () => {
    bootstrapObserver();
};
const deactivate = () => {
    // 今回は特に後処理なし
};
// register to GROWI
window.pluginActivators = window.pluginActivators ?? {};
window.pluginActivators[config.name] = { activate, deactivate };
