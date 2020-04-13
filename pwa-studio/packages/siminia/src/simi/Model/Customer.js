import { sendRequest } from 'src/simi/Network/RestMagento';

export const createAccount = (callBack, accountInfo) => {
    sendRequest('rest/V1/simiconnector/customers', callBack, 'POST', {}, accountInfo)
}

export const simiSignIn = (callBack, postData) => {
    sendRequest('rest/V1/integration/customer/token', callBack, 'POST', {getSessionId: 1}, postData)
}

export const editCustomer = (callBack, postData) => {
    sendRequest('rest/V1/simiconnector/customers', callBack, 'PUT', {}, postData);
}

export const checkExistingCustomer = (callBack, email) => {
    const params = {};
    params['customer_email'] = email;
    sendRequest('rest/V1/simiconnector/customers/checkexisting', callBack, 'GET', params);
}

export const forgotPassword = (callBack, email) => {
    sendRequest('rest/V1/simiconnector/customers/forgetpassword', callBack, 'GET', {email});
}

export const logout = (callBack, {}) => {
    sendRequest('rest/V1/simiconnector/customers/logout', callBack, 'POST', {}, {})
}

export const createPassword = (callBack, passwordInfo) => {
    sendRequest('/rest/V1/simiconnector/customers/createpassword', callBack, 'POST', {}, passwordInfo)
}

export const socialLogin = (callBack, accountInfo) => {
    sendRequest('/rest/V1/simiconnector/customers/sociallogin', callBack, 'POST', {}, accountInfo)
}