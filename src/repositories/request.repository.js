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

function hasOpenRequestsByEquipmentId(equipmentId) {
    return requestItems.some((item) => {
        return (
            item.equipmentId === equipmentId &&
            ['new', 'in_progress'].includes(item.status)
        );
    });
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
