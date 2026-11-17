(() => {
    const { NormalModuleReplacementPlugin } = require("webpack");
    // Okio calls tmpdir() if require("os") returns a module.
    const browserOs = 'export function tmpdir() { return "/tmp"; }';
    config.plugins.push(new NormalModuleReplacementPlugin(
        /^os$/,
        `data:text/javascript,${encodeURIComponent(browserOs)}`,
    ));

    config.resolve = config.resolve || {};
    config.resolve.fallback = { ...config.resolve.fallback, path: false };
})();
