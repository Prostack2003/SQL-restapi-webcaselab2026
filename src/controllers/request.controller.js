import * as requestService from '../services/request.service.js';

function createRequest(request, response) {
    const data = request.body;
    const createdRequest = requestService.createRequest(data);

    response.location(`/api/requests/${createdRequest.id}`);

    return response.status(201).json({
        data: createdRequest,
    });
}

function updateRequest(request, response) {
    const id = request.params.id;

    const requestItem = requestService.updateRequest(id, request.body);

    return response.status(200).json({
        data: requestItem,
    });
}

function deleteRequest(request, response) {
    const id = request.params.id;
    requestService.deleteRequest(id);

    return response.status(204).send();
}

function listRequests(request, response) {
    const { items, meta } = requestService.listRequests(request.validatedQuery);

    return response.status(200).json({
        data: items,
        meta,
    });
}

function getRequestById(request, response) {
    const id = request.params.id;
    const requestItem = requestService.getRequestById(id);

    return response.status(200).json({
        data: requestItem,
    });
}

function listRequestsByEquipmentId(request, response) {
    const id = request.params.id;
    const { items, meta } = requestService.listRequestsByEquipmentId(
        id,
        request.validatedQuery
    );

    return response.status(200).json({
        data: items,
        meta,
    });
}

function changeRequestStatus(request, response) {
    const id = request.params.id;
    const status = request.body.status;
    const requestItem = requestService.changeRequestStatus(id, status);

    return response.status(200).json({
        data: requestItem,
    });
}

export {
    createRequest,
    updateRequest,
    deleteRequest,
    changeRequestStatus,
    listRequests,
    listRequestsByEquipmentId,
    getRequestById,
};
