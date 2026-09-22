import { Router } from 'express';
import * as requestController from '../../controllers/request.controller.js';
import {
    validateRequestIdParams,
    validateCreateRequestBody,
    validateUpdateRequestBody,
    validateChangeRequestStatusBody,
    validateRequestQuery,
} from '../../middlewares/validate.middleware.js';

const requestRouter = Router();

requestRouter.get(
    '/requests',
    validateRequestQuery,
    requestController.listRequests
);
requestRouter.get(
    '/requests/:id',
    validateRequestIdParams,
    requestController.getRequestById
);

requestRouter.post(
    '/requests',
    validateCreateRequestBody,
    requestController.createRequest
);

requestRouter.patch(
    '/requests/:id',
    validateRequestIdParams,
    validateUpdateRequestBody,
    requestController.updateRequest
);

requestRouter.patch(
    '/requests/:id/status',
    validateRequestIdParams,
    validateChangeRequestStatusBody,
    requestController.changeRequestStatus
);

requestRouter.delete(
    '/requests/:id',
    validateRequestIdParams,
    requestController.deleteRequest
);

export { requestRouter };
