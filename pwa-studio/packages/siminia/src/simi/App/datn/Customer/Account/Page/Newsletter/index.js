import React from 'react';
import Identify from 'src/simi/Helper/Identify'
import Loading from "src/simi/BaseComponents/Loading";
import { connect } from 'src/drivers';
import { Simiquery, SimiMutation } from 'src/simi/Network/Query'
import CUSTOMER_NEWSLETTER from 'src/simi/queries/customerNewsletter.graphql';
import CUSTOMER_NEWSLETTER_UPDATE from 'src/simi/queries/customerNewsletterUpdate.graphql';
import { toggleMessages } from 'src/simi/Redux/actions/simiactions';
import PageTitle from 'src/simi/App/datn/Customer/Account/Components/PageTitle';
import { Colorbtn } from 'src/simi/BaseComponents/Button';
import RadioCheckbox from 'src/simi/App/datn/BaseComponents/RadioCheckbox';

const $ = window.$;

class Newsletter extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { user } = this.props;
        return (
            <div className='newsletter-wrap'>
                <PageTitle title={Identify.__("Newsletter Subscription ")} />
                <div className='subscription-title'>{Identify.__('Subscription option')}</div>
                <Simiquery query={CUSTOMER_NEWSLETTER}>
                    {({ loading, error, data }) => {
                        if (error) return <div>Data Fetch Error</div>;
                        if (loading) return <Loading />;
                        const { customer } = data;
                        const { is_subscribed } = customer;
                        let clicked = false;
                        return (
                            <SimiMutation mutation={CUSTOMER_NEWSLETTER_UPDATE}>
                                {(updateCustomer, { data }) => {
                                    if (data && data.updateCustomer && data.updateCustomer.customer) {
                                        if (data.updateCustomer.customer.is_subscribed === true) {
                                            this.props.toggleMessages([{
                                                type: 'success',
                                                message: Identify.__("You have been subscribed from the newsletter"),
                                                auto_dismiss: true
                                            }]);
                                        } else {
                                            this.props.toggleMessages([{
                                                type: 'success',
                                                message: Identify.__("You have been unsubscribed from the newsletter"),
                                                auto_dismiss: true
                                            }]);
                                        }
                                    }
                                    return (
                                        <>
                                            <div className="account-newsletter">
                                                <RadioCheckbox defaultChecked={is_subscribed} title={Identify.__('General Subscription')} id='checkbox-subscribe' />

                                                <div className="dash-action-buttons">
                                                    <Colorbtn text={Identify.__("Save")} className="save-subscription" onClick={() => {
                                                        if (!user.email) return false;
                                                        clicked = true;
                                                        const checkbox = $('.account-newsletter').find('input#checkbox-subscribe');
                                                        const isChecked = checkbox.is(":checked") ? true : false;
                                                        if (isChecked === is_subscribed) return false;
                                                        updateCustomer({ variables: { email: user.email, isSubscribed: isChecked } });
                                                    }} />
                                                </div>
                                            </div>
                                            {(data === undefined && clicked) && <Loading />}
                                        </>
                                    )
                                }}
                            </SimiMutation>
                        );
                    }}
                </Simiquery>
            </div>
        );
    }
}

const mapStateToProps = ({ user }) => {
    const { currentUser } = user
    return {
        user: currentUser
    };
}

const mapDispatchToProps = {
    toggleMessages,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Newsletter);
