import React from 'react';

import Identify from 'src/simi/Helper/Identify';
import Button from 'src/components/Button';


const ccType = (props) => {
    const { onSuccess } = props
    const submitCC = async () => {
        const card = {};
        setErrorMsg('');
        setHasError('');

        card["number"] = numberRef.current.value;
        card["exp_month"] = monthRef.current.value;
        card["exp_year"] = yearRef.current.value;
        card["cvc"] = cvcRef.current.value;

        if (!numberRef.current.value || !monthRef.current.value || !yearRef.current.value || !cvcRef.current.value) {
            if (!numberRef.current.value) {
                setHasError('number');
                setErrorMsg(Identify.__('Your card\'s expiration number is invalid'));
                return;
            }
            if (!monthRef.current.value) {
                setHasError('exp_month');
                setErrorMsg(Identify.__('Your card\'s expiration month is invalid'));
                return;
            }
            if (!yearRef.current.value) {
                setHasError('exp_year');
                setErrorMsg(Identify.__('Your card\'s expiration year is invalid'));
                return;
            }
            if (!cvcRef.current.value) {
                setHasError('cvc');
                setErrorMsg(Identify.__('Your card\'s security code is invalid.'));
                return;
            }
        }
        Identify.storeDataToStoreage(Identify.SESSION_STOREAGE, 'cc_card_data', card);
        onSuccess(cart)
    }

    return (
        <div className="container-cc_form">
            <div className={`cc-field form-group ${hasError === 'number' ? 'has-error' : ''}`}>
                <label htmlFor="cc_number">
                    {Identify.__('Credit Card Number')}
                    <span className="label-required">*</span>
                </label>
                <input name="cc_number" id="cc_number" ref={numberRef} defaultValue={initialValues && initialValues.hasOwnProperty('number') ? initialValues.number : ''} className="form-control" type="text" onInput={(e) => onCCNUmberInput(e)} placeholder="xxxx - xxxx - xxxx - xxxx" />
            </div>
            <div className={`cc-field form-group ${hasError === 'exp_month' ? 'has-error' : ''}`}>
                <label htmlFor="cc_month">
                    {Identify.__('Month')}
                    <span className="label-required">*</span>
                </label>
                <input name="cc_month" id="cc_month" ref={monthRef} defaultValue={initialValues && initialValues.hasOwnProperty('exp_month') ? initialValues.exp_month : ''} className="form-control" type="text" />
            </div>
            <div className={`cc-field form-group ${hasError === 'exp_year' ? 'has-error' : ''}`}>
                <label htmlFor="cc_year">
                    {Identify.__('Year')}
                    <span className="label-required">*</span>
                </label>
                <input name="cc_year" id="cc_year" ref={yearRef} defaultValue={initialValues && initialValues.hasOwnProperty('exp_year') ? initialValues.exp_year : ''} className="form-control" type="text" />
            </div>
            <div className={`cc-field form-group ${hasError === 'cvc' ? 'has-error' : ''}`}>
                <label htmlFor="cc_cvc">
                    {Identify.__('CVV')}
                    <span className="label-required">*</span>
                </label>
                <input name="cc_cvc" id="cc_cvc" ref={cvcRef} defaultValue={initialValues && initialValues.hasOwnProperty('cvc') ? initialValues.cvc : ''} className="form-control" type="text" />
            </div>
            {errorMsg && <div className="cc-msg-error">{errorMsg}</div>}
            <Button
                className='submitCC'
                style={{ marginTop: 10, marginBottom: 20 }}
                type="button"
                onClick={() => submitCC()}
            >{Identify.__('Use Card')}</Button>
        </div>
    );
}


export default ccType;