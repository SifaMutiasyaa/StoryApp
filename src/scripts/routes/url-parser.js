const UrlParser = {
  parseActiveUrlWithCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    const urlSplits = this._urlSplitter(url);
    return this._urlCombiner(urlSplits);
  },

  parseActiveUrlWithoutCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    const urlSplits = this._urlSplitter(url);
    return {
      resource: urlSplits.resource || null,
      id: urlSplits.id || null,
    };
  },

  _urlSplitter(url) {
    const segments = url.split('/').filter(Boolean); // filter kosong
    return {
      resource: segments[0] || null,
      id: segments[1] || null,
    };
  },

  _urlCombiner({ resource, id }) {
    if (!resource) return '/';
    if (id) return `/${resource}/:id`;
    return `/${resource}`;
  },
};

export default UrlParser;
