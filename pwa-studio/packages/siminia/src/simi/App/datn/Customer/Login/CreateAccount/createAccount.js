import React from 'react';
import { shape, string } from 'prop-types';
import { Form } from 'informed';
import TextInputCustom from '../TextInputCustom'
import { validators } from './validators';
import Identify from 'src/simi/Helper/Identify'
import { createAccount } from 'src/simi/Model/Customer'
import { showToastMessage } from 'src/simi/Helper/Message';
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading';
import { smoothScrollToView } from 'src/simi/Helper/Behavior';
import { toggleMessages } from 'src/simi/Redux/actions/simiactions';
import { connect } from 'src/drivers';
require('./createAccount.scss')

const $ = window.$;

const CreateAccount = props => {
    const { history, createAccountError, classes } = props;
    const errorMessage = createAccountError && (Object.keys(createAccountError).length !== 0) ? Identify.__('An error occurred. Please try again.') : null
    var registeringEmail = null
    var registeringPassword = null

    const initialValues = () => {
        const { initialValues } = props;
        const { email, firstName, lastName, ...rest } = initialValues;

        return {
            customer: { email, firstname: firstName, lastname: lastName },
            ...rest
        };
    }

    const handleSubmit = values => {
        const params = {
            password: values.password,
            confirm_password: values.confirm,
            ...values.customer,
            // news_letter: values.subscribe ? 1 : 0
        }
        const merchant = Identify.getStoreConfig();
        if (merchant && merchant.hasOwnProperty('storeConfig') && merchant.storeConfig) {
            const { website_id } = merchant.storeConfig;
            if (website_id) {
                params['website_id'] = website_id;
            }
        }
        showFogLoading()
        registeringEmail = values.customer.email
        registeringPassword = values.password
        createAccount(registerDone, params)
    };

    const registerDone = data => {
        hideFogLoading();
        if (data.errors) {
            let errorMsg = '';
            if (data.errors.length) {
                data.errors.map(error => {
                    errorMsg += error.message;
                });
                smoothScrollToView($('#root'));
                $('.create-acc-form')[0].reset();
                showToastMessage(errorMsg);
            }
        } else {
            props.onSignIn(registeringEmail, registeringPassword);
        }
    };

    return (
        <React.Fragment>
            <Form
                id="form-create-account"
                className={`create-acc-form ${classes} ${Identify.isRtl() ? classes['rtl-rootForm'] : null}`}
                initialValues={initialValues}
                onSubmit={handleSubmit}
            >
                <div className="lead1">
                    {Identify.__('Personal Information')}
                </div>
                <div className="firstname">
                    <TextInputCustom
                        classes={classes}
                        field="customer.firstname"
                        autoComplete="given-name"
                        validate={validators.get('firstName')}
                        validateOnBlur
                        placeholder={Identify.__('First Name')}
                    />
                </div>
                <div className="lastname">
                    <TextInputCustom
                        classes={classes}
                        field="customer.lastname"
                        autoComplete="family-name"
                        validate={validators.get('lastName')}
                        validateOnBlur
                        placeholder={Identify.__('Last Name')}
                    />
                </div>
                <div className="lead2">
                    {Identify.__('Sign-in Information')}
                </div>
                <div className="email">
                    <TextInputCustom
                        classes={classes}
                        field="customer.email"
                        autoComplete="email"
                        validate={validators.get('email')}
                        validateOnBlur
                        placeholder={Identify.__('Email')}
                    />
                </div>
                <div className="password">
                    <TextInputCustom
                        classes={classes}
                        field="password"
                        type="password"
                        autoComplete="new-password"
                        validate={validators.get('password')}
                        validateOnBlur
                        placeholder={Identify.__('Password')}
                    />
                </div>
                <div className="confirm" >
                    <TextInputCustom
                        classes={classes}
                        field="confirm"
                        type="password"
                        validate={validators.get('confirm')}
                        validateOnBlur
                        placeholder={Identify.__('Confirm Password')}
                    />
                </div>
                <div className="error">{errorMessage}</div>
                <div className="action">
                    <button
                        priority="high" className="submitbtn" type="submit"
                    >
                        {Identify.__('Register')}
                    </button>
                </div>
            </Form>
        </React.Fragment>
    );
}

const mapDispatchToProps = {
    toggleMessages
};

CreateAccount.propTypes = {
    createAccountError: shape({
        message: string
    }),
    initialValues: shape({
        email: string,
        firstName: string,
        lastName: string
    })
}

CreateAccount.defaultProps = {
    initialValues: {}
};

export default connect(null, mapDispatchToProps)(CreateAccount);
