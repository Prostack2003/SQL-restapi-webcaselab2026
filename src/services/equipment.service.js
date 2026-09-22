import { randomUUID } from 'node:crypto';
import * as equipmentRepository from '../repositories/equipment.repository.js';
import * as requestRepository from '../repositories/request.repository.js';
import { NotFoundError } from '../errors/not-found.error.js';
import { ConflictError } from '../errors/conflict.error.js';
import { ValidationError } from '../errors/validation.error.js';

function createEquipment(data) {
    validateInstalledAt(data.installedAt);
    const existingEquipment = equipmentRepository.findBySerialNumber(
        data.serialNumber
    );

    if (existingEquipment !== null) {
        throw new ConflictError(
            `Оборудование с серийным номером "${data.serialNumber}" уже существует`
        );
    }

    const equipment = {
        id: randomUUID(),
        name: data.name,
        type: data.type,
        serialNumber: data.serialNumber,
        location: structuredClone(data.location),
        status: data.status,
        installedAt: data.installedAt,
    };

    return equipmentRepository.create(equipment);
}

function listEquipment(query = {}) {
    let equipment = equipmentRepository.findAll();

    if (query.type) {
        equipment = equipment.filter((item) => {
            return item.type === query.type;
        });
    }

    if (query.status) {
        equipment = equipment.filter((item) => {
            return item.status === query.status;
        });
    }

    if (query.installedFrom) {
        equipment = equipment.filter((item) => {
            return item.installedAt >= query.installedFrom;
        });
    }

    if (query.installedTo) {
        equipment = equipment.filter((item) => {
            return item.installedAt <= query.installedTo;
        });
    }

    const sortBy = query.sortBy ?? 'name';

    equipment.sort((first, second) => {
        const comparison = first[sortBy].localeCompare(second[sortBy], 'ru');

        if (query.order === 'desc') {
            return -comparison;
        }

        return comparison;
    });

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const total = equipment.length;

    const startIndex = (page - 1) * limit;
    const items = equipment.slice(startIndex, startIndex + limit);

    return {
        items,
        meta: {
            total,
            page,
            limit,
        },
    };
}

function getEquipmentById(equipmentId) {
    const equipment = equipmentRepository.findById(equipmentId);
    if (equipment === null) {
        throw new NotFoundError(
            `Оборудование с идентификатором "${equipmentId}" не найдено`
        );
    }

    return equipment;
}

function updateEquipment(equipmentId, changes) {
    getEquipmentById(equipmentId);

    if (Object.keys(changes).length === 0) {
        throw new ValidationError('Переданы некорректные данные', [
            {
                field: 'body',
                message: 'Укажите хотя бы одно поле для обновления',
            },
        ]);
    }

    if (changes.serialNumber !== undefined) {
        const existingEquipment = equipmentRepository.findBySerialNumber(
            changes.serialNumber
        );

        if (
            existingEquipment !== null &&
            existingEquipment.id !== equipmentId
        ) {
            throw new ConflictError(
                `Оборудование с серийным номером "${changes.serialNumber}" уже существует`
            );
        }
    }

    if (changes.installedAt !== undefined) {
        validateInstalledAt(changes.installedAt);
    }

    return equipmentRepository.update(equipmentId, changes);
}

function deleteEquipment(equipmentId) {
    getEquipmentById(equipmentId);

    if (requestRepository.hasOpenRequestsByEquipmentId(equipmentId)) {
        throw new ConflictError(
            'Нельзя удалить оборудование, у которого есть открытые заявки'
        );
    }

    return equipmentRepository.remove(equipmentId);
}

function validateInstalledAt(installedAt) {
    const installedDate = new Date(installedAt);
    const currentDate = new Date();

    if (installedDate > currentDate) {
        throw new ValidationError('Переданы некорректные данные', [
            {
                field: 'installedAt',
                message: 'Дата установки не может быть в будущем',
            },
        ]);
    }
}

export {
    createEquipment,
    updateEquipment,
    deleteEquipment,
    listEquipment,
    getEquipmentById,
};
