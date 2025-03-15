const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            const userPermissions = req.userData.permissions;
            if (!userPermissions.includes(requiredPermission)) {
                return res.status(403).json({
                    message: 'Bạn không có quyền thực hiện thao tác này'
                });
            }
            next();
        } catch (error) {
            return res.status(403).json({
                message: 'Lỗi xác thực quyền'
            });
        }
    };
};

module.exports = checkPermission; 