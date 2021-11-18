function checkPermission(permission) {
    return (req, res, next) => {
        const { role } = req.user;

        let found = false;
        for (let i = 0; i < permission.length; i++) {
            if (!found) {
                if (role == permission[i]) {
                    found = true;
                }
            }
        }

        if (found) return next();
        res.status(403).send();
    }
}

function exceptPermission(permission) {
    return (req, res, next) => {
        const { role } = req.user;

        let found = false;
        for (let i = 0; i < permission.length; i++) {
            if (!found) {
                if (role == permission[i]) {
                    found = true;
                }
            }
        }

        if (!found) return next();
        res.status(403).send();
    }
}

module.exports = {
    checkPermission,
    exceptPermission
};