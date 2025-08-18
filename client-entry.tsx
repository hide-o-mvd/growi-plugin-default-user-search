import config from './package.json';
import { bootstrapObserver } from './src/bootstrap';

// 型は最小限。GROWI が読むのは activate / deactivate。
type Activator = { activate: () => void; deactivate: () => void; };

// SPA 遷移にも対応：常にブートするだけでOK（内部で1回だけ適用）
const activate = (): void => {
  bootstrapObserver();
};

const deactivate = (): void => {
  // 今回は特に後処理なし
};

// register to GROWI
(window as any).pluginActivators = (window as any).pluginActivators ?? {};
(window as any).pluginActivators[(config as any).name] = { activate, deactivate } as Activator;
