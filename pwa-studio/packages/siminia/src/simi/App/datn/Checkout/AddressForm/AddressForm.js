import React, { useCallback, useMemo } from 'react';
import { array, bool, func, object, shape, string } from 'prop-types';

import isObjectEmpty from 'src/util/isObjectEmpty';
import FormFields from './formFields';
import Identify from 'src/simi/Helper/Identify';
import { smoothScrollToView } from 'src/simi/Helper/Behavior';

const fields = [
    'id',
    'city',
    'email',
    'firstname',
    'lastname',
    'postcode',
    'region_code',
    'region',
    'street',
    'telephone',
    'company',
    'fax',
    'prefix',
    'suffix',
    'vat_id',
    'country_id',
    'save_in_address_book'
];

const defaultConfigFields = [
    'company_show',
    'street_show',
    'country_id_show',
    'region_id_show',
    'city_show',
    'zipcode_show',
    'telephone_show',
    'fax_show',
    'prefix_show',
    'suffix_show',
    'taxvat_show',
];

const defaultConfigValues = {
    'company_show': 'req',
    'street_show': 'req',
    'country_id_show': 'req',
    'region_id_show': 'req',
    'city_show': 'req',
    'zipcode_show': 'req',
    'telephone_show': 'req',
    'fax_show': '',
    'prefix_show': '',
    'suffix_show': '',
    'taxvat_show': '',
}

const DEFAULT_FORM_VALUES = {
    addresses_same: true
};

const AddressForm = props => {
    const {
        countries,
        isAddressInvalid,
        invalidAddressMessage,
        initialValues,
        submit,
        submitting,
        billingForm,
        billingAddressSaved,
        submitBilling,
        is_virtual,
        user
    } = props;

    const formId = props.id ? props.id : Identify.randomString()
    const validationMessage = isAddressInvalid ? invalidAddressMessage : null;

    let initialFormValues = initialValues;

    if (billingForm) {
        fields.push('addresses_same');
        if (isObjectEmpty(initialValues)) {
            initialFormValues = DEFAULT_FORM_VALUES;
        } else {
            if (initialValues.sameAsShippingAddress && !is_virtual) {
                initialFormValues = {
                    addresses_same: true
                };
            } else {
                initialFormValues = {
                    addresses_same: false,
                    ...initialValues
                };
                delete initialFormValues.sameAsShippingAddress;
            }
        }
    }

    const simiGetStoreConfig = Identify.getStoreConfig();
    const simiStoreViewCustomer = simiGetStoreConfig.simiStoreConfig.config.customer;

    const configFields = useMemo(
        () => {
            if (simiStoreViewCustomer && simiStoreViewCustomer.hasOwnProperty('address_fields_config')) {
                const { address_fields_config } = simiStoreViewCustomer;
                return defaultConfigFields.reduce((acc, key) => {
                    acc[key] = address_fields_config[key];
                    return acc;
                }, {})
            }
            return defaultConfigValues
        },
        [simiStoreViewCustomer]
    )
    const values = useMemo(
        () =>
            fields.reduce((acc, key) => {
                if (key === 'save_in_address_book') {
                    acc[key] = initialFormValues[key] ? true : false;
                } else {
                    acc[key] = initialFormValues[key];
                }

                return acc;
            }, {}),
        [initialFormValues]
    );

    let initialCountry;
    let selectableCountries;
    //const callGetCountries = { value: '', label: Identify.__('Please choose') }

    if (countries && countries.length) {
        selectableCountries = countries.map(
            ({ id, full_name_english }) => ({
                label: full_name_english,
                value: id
            })
        );
        initialCountry = values.country_id ? values.country_id : (countries[0].id ? countries[0].id : '')
    } else {
        selectableCountries = [];
        initialCountry = '';
    }
    //selectableCountries.unshift(callGetCountries);

    const handleSubmitBillingSameFollowShipping = useCallback(
        () => {
            const billingAddress = {
                sameAsShippingAddress: true
            }
            submitBilling(billingAddress);
        },
        [submitBilling]
    );

    const handleSubmit = (e) => {
        e.preventDefault()
        const submitValues = JSON.parse(JSON.stringify(values))
        let formValid = true
        $(`#${formId} input, #${formId} select`).each(function () {
            const inputField = $(this)
            if (inputField) {
                const value = inputField.val()
                if ((inputField.hasClass('isrequired') || inputField.attr('isrequired') === 'isrequired') && !value) {
                    inputField.addClass('warning')
                    formValid = false
                    smoothScrollToView(inputField, 350, 50)
                    return false
                }
                inputField.removeClass('warning')
                const name = inputField.attr('name')
                if (name) {
                    if (name === 'street[0]') {
                        submitValues.street = [value]
                    } else if (name === 'street[1]') {
                        submitValues.street.push(value)
                    } else if (name === 'emailaddress') {
                        submitValues['email'] = value
                    } else if (name === 'save_in_address_book') {
                        submitValues[name] = (inputField.is(":checked")) ? 1 : 0
                    } else if (name === 'region_code') {
                        //region will be filled form async action
                        submitValues['region'] = ''
                        submitValues[name] = value
                    } else {
                        submitValues[name] = value
                    }
                }
            }
        });
        if (!formValid)
            return
        if (submitValues.hasOwnProperty('addresses_same')) delete submitValues.addresses_same
        if (submitValues.hasOwnProperty('selected_address_field')) delete submitValues.selected_address_field
        if (submitValues.hasOwnProperty('password')) delete submitValues.password

        if (parseInt(submitValues.save_in_address_book) && !submitValues.id) {
            submitValues.save_in_address_book = 1;
        } else {
            submitValues.save_in_address_book = 0;
        }

        if (!submitValues.email && user && user.currentUser && user.currentUser.email)
            submitValues.email = user.currentUser.email;
            
        submit(JSON.parse(JSON.stringify(submitValues)));
        if (!billingForm && !billingAddressSaved) {
            handleSubmitBillingSameFollowShipping();
        }
    }

    const handleFormReset = () => {
        Object.keys(values).forEach(k => values[k] = null)
    }

    const formChildrenProps = {
        ...props,
        submitting,
        submit,
        validationMessage,
        initialCountry,
        selectableCountries,
        configFields,
        handleFormReset,
        formId
    };
    
    return (
        <form
            id={formId}
            onSubmit={handleSubmit}
            style={{ display: 'inline-block', width: '100%' }}
        >
            <FormFields {...formChildrenProps} initialValues={values} />
        </form>
    );
};

AddressForm.propTypes = {
    id: string,
    countries: array,
    invalidAddressMessage: string,
    initialValues: object,
    isAddressInvalid: bool,
    submit: func.isRequired,
    submitting: bool
};

AddressForm.defaultProps = {
    initialValues: {}
};

export default AddressForm;
