import React, { useRef, useState, useEffect, useCallback } from 'react';
import Identify from "src/simi/Helper/Identify";
import { connect } from 'src/drivers';
import { toggleMessages } from 'src/simi/Redux/actions/simiactions';
import { SimiMutation } from 'src/simi/Network/Query';
import { validateEmail, validateEmpty } from 'src/simi/Helper/Validation';
import Loading from "src/simi/BaseComponents/Loading";
import MUTATION_GRAPHQL from 'src/simi/queries/guestSubscribe.graphql'
import { smoothScrollToView } from 'src/simi/Helper/Behavior';

const Subscriber = props => {
    const emailInput = useRef('');
    const mutationRef = useRef('');
    const [invalid, setInvalid] = useState('');
    const [errorEmail, setErrorEmail] = useState('defaultError');
    const [submited, setSubmited] = useState(false);
    const [waiting, setWaiting] = useState(false);

    const formAction = (e) => {
        e.preventDefault();
        if (validateForm()) {
            $(mutationRef.current).trigger('click');
        }
        setSubmited(true);
    }

    const mutationAction = (mutation) => {
        mutation({ variables: { email: emailInput.current.value } });
        setWaiting(true);
    }

    const responseLoaded = (data) => {
        if (data && data.subscribe && data.subscribe.message) {
            setWaiting(false);
            if (data.subscribe.status === 'error') {
                smoothScrollToView($("#id-message"));
                props.toggleMessages([{
                    type: 'error',
                    message: data.subscribe.message,
                    auto_dismiss: true
                }]);
            }
            if (data.subscribe.status === '1') {
                smoothScrollToView($("#id-message"));
                if (waiting) {
                    props.toggleMessages([{
                        type: 'success',
                        message: data.subscribe.message,
                        auto_dismiss: true
                    }]);
                    emailInput.current.value = ''; //reset form
                }
            }
        }
    }

    const validateForm = () => {

        if (!validateEmail(emailInput.current.value)) {
            setInvalid('error invalid');
            setErrorEmail('showError');
            return false;
        }
        setInvalid('');
        setErrorEmail('defaultError');
        return true;
    }

    const validateChange = () => {
        if (submited) {
            validateForm();
        }
    }

    const checkEmpty = () => {
        if (!validateEmpty(emailInput.current.value)) {
            setInvalid('');
            setErrorEmail('defaultError');
        }
    }

    const className = props.className ? props.className : '';
    const classForm = `${className} subscriber-form ${invalid}`;

    return (
        <React.Fragment>
            <SimiMutation mutation={MUTATION_GRAPHQL}>
                {(subscribeCall, { data }) => {
                    if (data && data.subscribe && data.subscribe.message) {
                        {/* console.log(data) */ }
                        responseLoaded(data);
                    }
                    return (
                        <button onClick={(e) => mutationAction(subscribeCall)} ref={mutationRef} style={{ display: 'none' }} />
                    )
                }}
            </SimiMutation>
            <div className={classForm}>
                <form className={props.formClassName} onSubmit={formAction}>
                    <input
                        id="subcriber-email"
                        onKeyUp={checkEmpty}
                        onChange={validateChange}
                        ref={emailInput} name="email"
                        className={`email ${invalid}`}
                        placeholder={Identify.__('Enter your email ')}
                    />
                    <button type="submit">
                        {Identify.__('subcribe')}
                    </button>
                </form>
            </div>
            <div className={`${errorEmail}`}>{Identify.__('Your email address is invalid. Please enter a valid address !')}</div>
            {waiting && <Loading />}
        </React.Fragment>
    )
}

const mapDispatchToProps = {
    toggleMessages,
}

export default connect(
    null,
    mapDispatchToProps
)(Subscriber);