import { randomUUID } from 'node:crypto';
import * as requestRepository from '../repositories/request.repository.js';
import * as equipmentRepository from '../repositories/equipment.repository.js';
import { NotFoundError } from '../errors/not-found.error.js';
import { ValidationError } from '../errors/validation.error.js';
import { ConflictError } from '../errors/conflict.error.js';

const ALLOWED_STATUS_TRANSITIONS = {
    new: ['in_progress', 'rejected'],
    in_progress: ['done', 'rejected'],
    done: [],
    rejected: [],
};

const PRIORITY_ORDER = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
};

function createRequest(data) {
    const equipment = equipmentRepository.findById(data.equipmentId);

    if (!equipment) {
        throw new NotFoundError('Такого оборудования не существует');
    }

    const now = new Date().toISOString();

    const requestObject = {
        id: randomUUID(),
        equipmentId: data.equipmentId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'new',
        plannedAt: data.plannedAt,
        createdAt: now,
        updatedAt: now,
    };

    return requestRepository.create(requestObject);
}

function updateRequest(requestId, changes) {
    getRequestById(requestId);

    if (Object.keys(changes).length === 0) {
        throw new ValidationError('Переданы некорректные данные', [
            {
                field: 'body',
                message: 'Укажите хотя бы одно поле для обновления',
            },
        ]);
    }

    if (changes.equipmentId !== undefined) {
        const equipment = equipmentRepository.findById(changes.equipmentId);

        if (equipment === null) {
            throw new NotFoundError(
                `Оборудование с идентификатором "${changes.equipmentId}" не найдено`
            );
        }
    }

    const allowedChanges = {
        updatedAt: new Date().toISOString(),
    };

    if (changes.equipmentId !== undefined) {
        allowedChanges.equipmentId = changes.equipmentId;
    }

    if (changes.title !== undefined) {
        allowedChanges.title = changes.title;
    }

    if (changes.description !== undefined) {
        allowedChanges.description = changes.description;
    }

    if (changes.priority !== undefined) {
        allowedChanges.priority = changes.priority;
    }

    if (changes.plannedAt !== undefined) {
        allowedChanges.plannedAt = changes.plannedAt;
    }

    return requestRepository.update(requestId, allowedChanges);
}

function deleteRequest(requestId) {
    getRequestById(requestId);
    return requestRepository.remove(requestId);
}

function getRequestById(requestId) {
    const request = requestRepository.findById(requestId);
    if (!request) {
        throw new NotFoundError(
            `Заявка с идентификатором ${requestId} не найдена`
        );
    }
    return request;
}

function filterSortAndPaginateRequests(requests, query = {}) {
    let filteredRequests = requests;

    if (query.status) {
        filteredRequests = filteredRequests.filter(
            (item) => item.status === query.status
        );
    }

    if (query.priority) {
        filteredRequests = filteredRequests.filter(
            (item) => item.priority === query.priority
        );
    }

    if (query.equipmentId) {
        filteredRequests = filteredRequests.filter(
            (item) => item.equipmentId === query.equipmentId
        );
    }

    if (query.createdFrom) {
        const createdFromTimestamp = Date.parse(query.createdFrom);
        filteredRequests = filteredRequests.filter(
            (item) => Date.parse(item.createdAt) >= createdFromTimestamp
        );
    }

    if (query.createdTo) {
        const createdToTimestamp = Date.parse(query.createdTo);
        filteredRequests = filteredRequests.filter(
            (item) => Date.parse(item.createdAt) <= createdToTimestamp
        );
    }

    const sortBy = query.sortBy ?? 'createdAt';

    filteredRequests.sort((first, second) => {
        let comparison;

        if (sortBy === 'priority') {
            comparison =
                PRIORITY_ORDER[first.priority] -
                PRIORITY_ORDER[second.priority];
        } else {
            comparison = String(first[sortBy] ?? '').localeCompare(
                String(second[sortBy] ?? ''),
                'ru'
            );
        }

        if (query.order === 'desc') {
            return -comparison;
        }

        return comparison;
    });

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const total = filteredRequests.length;
    const startIndex = (page - 1) * limit;
    const items = filteredRequests.slice(startIndex, startIndex + limit);

    return {
        items,
        meta: {
            total,
            page,
            limit,
        },
    };
}

function listRequests(query = {}) {
    let requests = requestRepository.findAll();

    return filterSortAndPaginateRequests(requests, query);
}

function changeRequestStatus(requestId, newStatus) {
    const maintenanceRequest = getRequestById(requestId);

    const allowedStatuses =
        ALLOWED_STATUS_TRANSITIONS[maintenanceRequest.status];

    if (!allowedStatuses.includes(newStatus)) {
        throw new ConflictError(
            `Переход статуса из "${maintenanceRequest.status}" в "${newStatus}" запрещён`
        );
    }

    return requestRepository.update(requestId, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
    });
}

function listRequestsByEquipmentId(equipmentId, query = {}) {
    const equipment = equipmentRepository.findById(equipmentId);

    if (!equipment) {
        throw new NotFoundError(
            `Оборудование с идентификатором "${equipmentId}" не найдено`
        );
    }

    const requests = requestRepository.findByEquipmentId(equipmentId);

    return filterSortAndPaginateRequests(requests, query);
}

export {
    createRequest,
    updateRequest,
    deleteRequest,
    getRequestById,
    listRequests,
    changeRequestStatus,
    listRequestsByEquipmentId,
};
