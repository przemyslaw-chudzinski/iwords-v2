module.exports = {
    activatedRoute(routeName, expectedRouteName, activeClassname = 'active') {
        // if (routeName === expectedRouteName) {
        //     return activeClassname;
        // }
        if (routeName.includes(expectedRouteName)) {
            return activeClassname;
        }
        return '';
    }
};
