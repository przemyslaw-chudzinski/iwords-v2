module.exports = {
    activatedRoute(routeName, expectedRouteName, activeClassname = 'active') {
        if (routeName === expectedRouteName) {
            return activeClassname;
        }
        return '';
    }
};
