import { Op } from 'sequelize';
import { MaintenanceRequest } from '../database/models/index.js';

const requestItems = [];

function create(maintenanceRequest) {
    const clone = structuredClone(maintenanceRequest);

    requestItems.push(clone);

    return structuredClone(clone);
}

function findAll() {
    return structuredClone(requestItems);
}

function findById(id) {
    const foundItem = requestItems.find((item) => item.id === id);

    if (foundItem === undefined) {
        return null;
    }

    return structuredClone(foundItem);
}

function update(id, changes) {
    const index = requestItems.findIndex((item) => item.id === id);

    if (index === -1) {
        return null;
    }

    const newRequest = {
        ...requestItems[index],
        ...structuredClone(changes),
    };

    requestItems[index] = newRequest;

    return structuredClone(newRequest);
}

function remove(id) {
    const index = requestItems.findIndex((request) => request.id === id);

    if (index === -1) {
        return null;
    }

    const [removedElement] = requestItems.splice(index, 1);

    return structuredClone(removedElement);
}

function findByEquipmentId(equipmentId) {
    const foundEquipment = requestItems.filter(
        (item) => item.equipmentId === equipmentId
    );
    return structuredClone(foundEquipment);
}

async function hasOpenRequestsByEquipmentId(equipmentId) {
    const openRequestsCount = await MaintenanceRequest.count({
        where: {
            equipmentId,
            status: {
                [Op.in]: ['new', 'in_progress'],
            },
        },
    });

    return openRequestsCount > 0;
}

export {
    create,
    findAll,
    findById,
    update,
    remove,
    findByEquipmentId,
    hasOpenRequestsByEquipmentId,
};
