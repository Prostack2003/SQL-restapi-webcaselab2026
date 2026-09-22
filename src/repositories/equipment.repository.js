const equipmentItems = [];

function create(equipment) {
    const storedEquipment = structuredClone(equipment);
    equipmentItems.push(storedEquipment);
    return structuredClone(storedEquipment);
}

function update(equipmentId, equipmentChanges) {
    const index = equipmentItems.findIndex(
        (equipment) => equipment.id === equipmentId
    );

    if (index === -1) {
        return null;
    }

    const newEquipment = {
        ...equipmentItems[index],
        ...structuredClone(equipmentChanges),
    };

    equipmentItems[index] = newEquipment;

    return structuredClone(newEquipment);
}

function remove(equipmentId) {
    const index = equipmentItems.findIndex(
        (equipment) => equipment.id === equipmentId
    );

    if (index === -1) {
        return null;
    }

    const [removedElement] = equipmentItems.splice(index, 1);

    return structuredClone(removedElement);
}

function findAll() {
    return structuredClone(equipmentItems);
}

function findById(id) {
    const foundItem = equipmentItems.find((item) => item.id === id);

    if (foundItem === undefined) {
        return null;
    }

    return structuredClone(foundItem);
}

function findBySerialNumber(serialNumber) {
    const normalizedSerialNumber = serialNumber.toLowerCase();
    const foundItem = equipmentItems.find(
        (item) => item.serialNumber.toLowerCase() === normalizedSerialNumber
    );

    if (foundItem === undefined) {
        return null;
    }

    return structuredClone(foundItem);
}

export { create, update, remove, findAll, findById, findBySerialNumber };
