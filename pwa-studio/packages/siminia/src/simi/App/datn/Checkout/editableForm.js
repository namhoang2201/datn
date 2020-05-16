import React, { useCallback, Fragment } from 'react';
import { bool, func, object, oneOf, string } from 'prop-types';

import AddressForm from './AddressForm/AddressForm';
import AddressItem from 'src/simi/BaseComponents/Address';
import isObjectEmpty from 'src/util/isObjectEmpty';
import {getAllowedCountries} from 'src/simi/Helper/Countries'

/**
 * The EditableForm component renders the actual edit forms for the sections
 * within the form.
 */

const EditableForm = props => {
    const {
        editing,
        submitShippingAddress,
        submitting,
        isAddressInvalid,
        invalidAddressMessage,
        submitBillingAddress,
        user,
        simiSignedIn,
        toggleMessages,
        is_virtual,
    } = props;
    const countries = getAllowedCountries()

    const handleSubmitAddressForm = useCallback(
        formValues => {
            submitShippingAddress({
                formValues
            });
        },
        [submitShippingAddress]
    );

    const handleSubmitBillingForm = useCallback(
        formValues => {
            submitBillingAddress(formValues);
        },
        [submitBillingAddress]
    );

    switch (editing) {
        case 'shippingAddress': {
            const {billingAddress} = props;
            let { shippingAddress } = props;
            if (!shippingAddress) {
                shippingAddress = undefined;
            }

            return (
                <Fragment>
                    <AddressForm
                        id="shippingAddressForm"
                        countries={countries}
                        isAddressInvalid={isAddressInvalid}
                        invalidAddressMessage={invalidAddressMessage}
                        initialValues={shippingAddress}
                        submit={handleSubmitAddressForm}
                        submitting={submitting}
                        billingAddressSaved={billingAddress}
                        submitBilling={handleSubmitBillingForm}
                        user={user}
                        simiSignedIn={simiSignedIn}
                        toggleMessages={toggleMessages}
                    />
                    {shippingAddress && !isObjectEmpty(shippingAddress) ?
                        <AddressItem data={shippingAddress} /> : null}
                </Fragment>
            );
        }

        case 'billingAddress': {
            let { billingAddress } = props;
            if (!billingAddress) {
                billingAddress = undefined;
            }

            return (
                <Fragment>
                    <AddressForm
                        id="billingAddressForm"
                        countries={countries}
                        isAddressInvalid={isAddressInvalid}
                        invalidAddressMessage={invalidAddressMessage}
                        initialValues={billingAddress}
                        submit={handleSubmitBillingForm}
                        submitting={submitting}
                        billingForm={true}
                        user={user}
                        simiSignedIn={simiSignedIn}
                        is_virtual={is_virtual}
                    />
                    {billingAddress && !isObjectEmpty(billingAddress) && !billingAddress.hasOwnProperty('sameAsShippingAddress') ?
                        <AddressItem data={billingAddress} /> : null}
                </Fragment>

            );
        }

        default: {
            return null;
        }
    }
};

EditableForm.propTypes = {
    editing: oneOf(['shippingAddress', 'billingAddress']),
    shippingAddress: object,
    submitShippingAddress: func.isRequired,
    submitBillingAddress: func.isRequired,
    submitting: bool,
    isAddressInvalid: bool,
    invalidAddressMessage: string,
    user: object
};

export default EditableForm;
