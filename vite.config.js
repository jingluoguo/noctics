import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(function (_a) {
    var mode = _a.mode;
    var env = loadEnv(mode, '.', '');
    return {
        base: env.GITHUB_PAGES === 'true' ? '/noctics/' : '/',
        plugins: [react()]
    };
});
