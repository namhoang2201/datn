import { sendRequest } from 'src/simi/Network/RestMagento';

export const getTransactions = (callBack, params = {}) => {
    sendRequest('/rest/V1/simiconnector/transactions', callBack, 'GET', params)
}