export const validateDevice = (data: any) => {
    const errors: Record<string, string> = {};

    if (!data.name?.trim()) {
        errors.name = 'Tên thiết bị không được để trống';
    }

    if (!data.category?.trim()) {
        errors.category = 'Danh mục không được để trống';
    }

    if (!data.serialNumber?.trim()) {
        errors.serialNumber = 'Số serial không được để trống';
    } else if (!/^[A-Za-z0-9]+$/.test(data.serialNumber)) {
        errors.serialNumber = 'Số serial chỉ được chứa chữ cái và số';
    }

    if (!data.status?.trim()) {
        errors.status = 'Trạng thái không được để trống';
    }

    if (typeof data.quantity !== 'number' || data.quantity < 0) {
        errors.quantity = 'Số lượng phải là số dương';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}; 