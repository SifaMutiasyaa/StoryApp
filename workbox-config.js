module.exports = {
  swSrc: 'src/public/service-worker.js',      // Lokasi service worker kamu
  swDest: 'dist/service-worker.js',    // Lokasi output setelah di-inject
  globDirectory: 'dist',               // Folder berisi file hasil build
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,svg,woff2,json}'
  ],
};
