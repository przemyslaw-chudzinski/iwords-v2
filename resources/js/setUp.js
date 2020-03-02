const metaElement = document.querySelector('meta[name=userId]');
window.IWORDS = {};
window.IWORDS.editors = {};
window.IWORDS.userId = metaElement ? metaElement.getAttribute('content').trim() : null;
