import React from 'react';

import PaymentsFormItems from './paymentsFormItems';

require('./PaymentsForm.scss')

const PaymentsForm = props => {
    const { submitPaymentMethod, paymentMethods, paymentCode, paymentData } = props;

    return React.useMemo(() => {
        if (!submitPaymentMethod || !paymentMethods || !paymentMethods.length)
            return ''
        return (
            <div className='paymentform-root' >
                <PaymentsFormItems
                    submit={submitPaymentMethod}
                    {...{
                        paymentMethods,
                        paymentCode,
                        paymentData
                    }} />
            </div>
        )
    }, [
        paymentMethods,
        paymentCode,
        submitPaymentMethod,
        paymentData])
};

export default PaymentsForm;
