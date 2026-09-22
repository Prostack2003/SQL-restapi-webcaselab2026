import * as equipmentService from '../services/equipment.service.js';

function createEquipment(request, response) {
    const equipment = equipmentService.createEquipment(request.body);
    response.location(`/api/equipment/${equipment.id}`);

    return response.status(201).json({
        data: equipment,
    });
}

function updateEquipment(request, response) {
    const id = request.params.id;
    const equipment = equipmentService.updateEquipment(id, request.body);

    return response.status(200).json({
        data: equipment,
    });
}

function deleteEquipment(request, response) {
    const id = request.params.id;
    equipmentService.deleteEquipment(id);

    return response.status(204).send();
}

function listEquipment(request, response) {
    const { items, meta } = equipmentService.listEquipment(
        request.validatedQuery
    );

    return response.status(200).json({
        data: items,
        meta,
    });
}

function getEquipmentById(request, response) {
    const id = request.params.id;
    const equipment = equipmentService.getEquipmentById(id);

    return response.status(200).json({
        data: equipment,
    });
}

export {
    createEquipment,
    updateEquipment,
    deleteEquipment,
    listEquipment,
    getEquipmentById,
};
