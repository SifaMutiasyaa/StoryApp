const Utils = {
    parseActiveUrlWithCombiner() {
      const url = window.location.hash.slice(1).toLowerCase();
      const urlSplits = this._urlSplitter(url);
  
      return (urlSplits.length > 2)
        ? `/${urlSplits[1]}/${urlSplits[2]}`
        : (urlSplits.length === 2)
          ? `/${urlSplits[1]}`
          : '/';
    },
  
    parseActiveUrlWithoutCombiner() {
      const url = window.location.hash.slice(1).toLowerCase();
      const urlSplits = this._urlSplitter(url);
      return {
        resource: urlSplits[1] || null,
        id: urlSplits[2] || null,
      };
    },
  
    _urlSplitter(url) {
      return url.split('/');
    },
  
    setLoading(isLoading) {
      const loader = document.getElementById('global-loader');
      if (loader) {
        loader.style.display = isLoading ? 'block' : 'none';
      }
    },
  };
  
  export default Utils;
  