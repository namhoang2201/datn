import React, { useCallback, Fragment, useState } from 'react';

import Button from 'src/components/Button';
import isObjectEmpty from 'src/util/isObjectEmpty';
import Identify from 'src/simi/Helper/Identify';
import BraintreeDropin from './paymentMethods/braintreeDropin';
import StripeCCType from './paymentMethods/stripeCCType';
import CcType from './paymentMethods/ccType';
import Radio from 'src/simi/BaseComponents/Icon/Radio'
import RadioChecked from 'src/simi/BaseComponents/Icon/RadioChecked'
import { Colorbtn } from 'src/simi/BaseComponents/Button';
import { showToastMessage } from 'src/simi/Helper/Message';

const PaymentsFormItems = props => {
    const {
        submit,
        paymentMethods,
        paymentCode,
        paymentData
    } = props;

    const [isSubmitting, setIsSubmitting] = useState(false);

    let selectablePaymentMethods;

    if (paymentMethods && paymentMethods.length) {
        selectablePaymentMethods = paymentMethods.map(
            ({ code, title }) => ({
                label: title,
                value: code
            })
        );
    } else {
        selectablePaymentMethods = []
    }

    const selectPaymentMethod = (p_method_code) => {
        let parseData = {};
        if (paymentMethods && paymentMethods.length) {
            parseData = selectablePaymentMethods.find(
                ({ value }) => value === p_method_code
            );
            handleSuccess(p_method_code, parseData)
        }
    }

    const handleSuccess = useCallback(
        (payment_method, value) => {
            setIsSubmitting(false);
            submit({
                code: payment_method,
                data: value
            });
        },
        [setIsSubmitting, submit]
    );

    const handleSavePO = () => {
        var POInput = document.getElementById('purchaseorder_number')
        if (POInput && POInput.value)
            handleSuccess('purchaseorder', { purchaseorder: POInput.value });
        else {
            $('.go-place_order').addClass('payment-not-ready')
            showToastMessage(Identify.__('Please insert PO number'))
        }
    }
    
    const renderMethod = () => {
        let mt = null;
        $('.go-place_order').removeClass('payment-not-ready')
        if (paymentMethods.length) {
            mt = paymentMethods.map(ite => {
                if (
                    ite.code === 'pmclain_stripe_vault' ||
                    ite.code === 'paypal_express_bml' ||
                    ite.code === 'braintree_paypal'
                )
                    return ''
                let frameCard = '';
                const isSelected = (paymentCode === ite.code)
                if (isSelected) {
                    if (ite.code === 'purchaseorder') {
                        if (!paymentData.purchaseorder)
                            $('.go-place_order').addClass('payment-not-ready')
                        frameCard = (
                            <div className="purchaseorder-frame">
                                <input
                                    defaultValue={paymentData.purchaseorder?paymentData.purchaseorder:''}
                                    name="purchaseorder_number" id="purchaseorder_number"
                                    placeholder={Identify.__("Purchase Order Number")} />
                                <Colorbtn
                                    onClick={() => handleSavePO()}
                                    text={"Save"}
                                    className="purcahseorder-action" />
                            </div>
                        )
                    }

                    // brain tree default magento pwa-studio
                    if (ite.code === 'braintree') {
                        if (!paymentData.nonce && !paymentData.details)
                            $('.go-place_order').addClass('payment-not-ready')
                        let braintree_token = process.env.CHECKOUT_BRAINTREE_TOKEN
                        if (ite.simi_payment_data && ite.simi_payment_data.braintree_token) 
                            braintree_token = ite.simi_payment_data.braintree_token
                        frameCard = <Fragment>
                            <BraintreeDropin 
                                authorization={braintree_token}
                                shouldRequestPaymentNonce={isSubmitting}
                                onError={()=>setIsSubmitting(false)}
                                onSuccess={(value) => handleSuccess(ite.code, value)} />
                            <Colorbtn
                                className="usecard-braintree-button"
                                onClick={() => setIsSubmitting(true)}
                                text={Identify.__('Use Card')}
                            />
                        </Fragment>
                    } else if (ite.hasOwnProperty('simi_payment_data') && !isObjectEmpty(ite.simi_payment_data)) {
                        if (ite.code === 'pmclain_stripe') {
                            // stripe payment
                            frameCard = <StripeCCType
                                onSuccess={(value) => handleSuccess(ite.code, value)}
                                paymentContent={ite.simi_payment_data}
                                payment_method={ite.code}
                                paymentData={paymentData}
                                />
                        } else if (parseInt(ite.simi_payment_data.show_type, 10) === 1) {
                            // payment type 1
                            frameCard = <CcType  onSuccess={(value) => handleSuccess(ite.code, value)} />
                        } else if (parseInt(ite.simi_payment_data.show_type, 10) === 3) {
                            // payment type 3
                            frameCard = 'Coming soon!'
                        }
                    }
                }

                return (
                    <div className="payment-method-item" key={ite.code} >
                        <div
                            role="presentation" className="payment-method-topper"
                            onClick={() => selectPaymentMethod(ite.code)}>
                            <span className="radio-btn">
                                {isSelected ? <RadioChecked /> : <Radio />}
                            </span>
                            <span className="payment-title">
                                {ite.title}
                            </span>
                        </div>
                        <div className="payment-frame">
                            {frameCard}
                        </div>
                    </div>
                )
            });
        }
        return mt;
    }

    return (
        <Fragment>
            <div className='body'>
                <div className='payment-method-items'>
                    {renderMethod()}
                </div>
            </div>

        </Fragment>
    );
}

export default PaymentsFormItems;
