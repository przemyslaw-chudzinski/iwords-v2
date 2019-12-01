const contentProviders = {
    diki: 'diki'
};

function validateContentProvider(provider) {
    return Object.values(contentProviders).includes(provider)
}

module.exports = {
    contentProviders,
    validateContentProvider
};
