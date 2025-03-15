const Device = require('../models/Device');
const { Op } = require('sequelize');

exports.getAllDevices = async (req, res) => {
    try {
        const devices = await Device.findAll();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách thiết bị' });
    }
};

exports.createDevice = async (req, res) => {
    try {
        const device = await Device.create(req.body);
        res.status(201).json(device);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi tạo thiết bị mới' });
    }
};

exports.updateDevice = async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);
        if (!device) {
            return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
        }
        await device.update(req.body);
        res.json(device);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi cập nhật thiết bị' });
    }
};

exports.deleteDevice = async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);
        if (!device) {
            return res.status(404).json({ message: 'Không tìm thấy thiết bị' });
        }
        await device.destroy();
        res.json({ message: 'Xóa thiết bị thành công' });
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi xóa thiết bị' });
    }
};

exports.searchDevices = async (req, res) => {
    try {
        const filters = req.body.filters;
        
        const whereClause = {};
        filters.forEach(filter => {
            switch (filter.operator) {
                case 'eq':
                    whereClause[filter.field] = filter.value;
                    break;
                case 'gt':
                    whereClause[filter.field] = { [Op.gt]: filter.value };
                    break;
                case 'lt':
                    whereClause[filter.field] = { [Op.lt]: filter.value };
                    break;
                case 'contains':
                    whereClause[filter.field] = { [Op.iLike]: `%${filter.value}%` };
                    break;
            }
        });

        const devices = await Device.findAll({
            where: whereClause,
            order: [['updatedAt', 'DESC']]
        });

        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tìm kiếm thiết bị' });
    }
}; 