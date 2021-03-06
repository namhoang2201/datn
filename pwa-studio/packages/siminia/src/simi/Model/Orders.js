import { sendRequest } from 'src/simi/Network/RestMagento';

export const getOrderDetail = (id,callBack) => {
    sendRequest(`/rest/V1/simiconnector/orders/${id}`, callBack)
}

export const getReOrder = (id, callBack) => {
    sendRequest(`/rest/V1/simiconnector/orders/${id}?reorder=1`,callBack)
}

export const getOrderDetailByEntityId = (id,callBack) => {
    sendRequest(`rest/V1/simiconnector/orders/${id}?by_entity_id=1`, callBack)
}