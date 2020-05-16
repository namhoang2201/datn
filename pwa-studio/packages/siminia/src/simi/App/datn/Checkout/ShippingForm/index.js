import React, { useMemo, useCallback } from 'react';
import Radio from 'src/simi/BaseComponents/Icon/Radio'
import RadioChecked from 'src/simi/BaseComponents/Icon/RadioChecked'
import { Price, Util } from '@magento/peregrine'
const { BrowserPersistence } = Util;
const storage = new BrowserPersistence();
require('./ShippingForm.scss')


const ShippingForm = props => {
    const { shippingMethod, availableShippingMethods, submitShippingMethod, cartCurrencyCode } = props
    const handleSubmitShippingMethod = useCallback((data) => {
        submitShippingMethod(data)
    }, [submitShippingMethod])

    const storedShippingMethod = storage.getItem('shippingMethod');

    return useMemo(() => {
        if (availableShippingMethods && availableShippingMethods.length && cartCurrencyCode) {
            const carriers = {}
            const carriersName = {}
            availableShippingMethods.map((availableShippingMethod, index) => {
                const { carrier_code, method_title, carrier_title, method_code, amount, code } = availableShippingMethod
                if (!carriers[carrier_code])
                    carriers[carrier_code] = []
                carriersName[carrier_code] = carrier_title

                let isSelected = false;
                if (storedShippingMethod){
                    isSelected = storedShippingMethod.hasOwnProperty('carrier_code') && storedShippingMethod.carrier_code === carrier_code && storedShippingMethod.hasOwnProperty('method_code') && storedShippingMethod.method_code === method_code
                }else{
                    isSelected = shippingMethod === code;
                }

                carriers[carrier_code].push(
                    <div
                        role="presentation"
                        className="shipping-method" key={index}
                        onClick={
                            () => {
                                const newSMethod = { carrier_code, method_code }
                                handleSubmitShippingMethod({ formValues: { shippingMethod: newSMethod } })
                            }
                        }
                    >
                        <span className="radio-btn">
                            {isSelected ? <RadioChecked /> : <Radio />}
                        </span>
                        <span className="radio-title">{method_title} <Price currencyCode={cartCurrencyCode} value={amount} />
                        </span>
                    </div>
                )
            })
            return (
                <div className="shipping-form">
                    {
                        Object.keys(carriers).map((key) => {
                            return (
                                <div className="shipping-form-carrier" key={key}>
                                    <div className="carrier-title">{carriersName[key]}</div>
                                    {carriers[key]}
                                </div>
                            )
                        })
                    }
                </div>

            )
        }
        return ''
    }, [shippingMethod, availableShippingMethods, handleSubmitShippingMethod, cartCurrencyCode, storedShippingMethod])
}

export default ShippingForm
