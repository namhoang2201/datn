import React, { useState } from 'react';
import Identify from 'src/simi/Helper/Identify';
import TitleHelper from 'src/simi/Helper/TitleHelper'
import { getOrderDetailByEntityId } from 'src/simi/Model/Orders'
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading';
import { getCartDetails, clearCartId } from 'src/actions/cart';
import { connect } from 'src/drivers';
import { resetCheckout } from 'src/actions/checkout';
import { Colorbtn } from '../../../../BaseComponents/Button';
import { smoothScrollToView } from 'src/simi/Helper/Behavior';

require('./thankyou.scss')

const Thankyou = props => {
    hideFogLoading()
    smoothScrollToView($("#root"));
    const { history, isSignedIn, resetCheckout, getCartDetails } = props;
    if (resetCheckout) {
        clearCartId()
        resetCheckout()
        getCartDetails()
    }
    const [orderIncrementId, setOrderIncrementId] = useState(Identify.findGetParameter('order_increment_id'))
    const orderEntityId = Identify.findGetParameter('order_entity_id')

    const handleViewOrderDetails = () => {
        if (!orderIncrementId) {
            history.push('/');
            return;
        }
        const orderId = '/orderdetails.html/' + orderIncrementId;
        const orderLocate = {
            pathname: orderId,
            state: {
                orderData: {
                    increment_id: orderIncrementId
                }
            }
        }
        history.push(orderLocate);
        smoothScrollToView($("#root"));
    }

    if (!orderIncrementId && orderEntityId && isSignedIn) {
        showFogLoading()
        getOrderDetailByEntityId(orderEntityId, (orderData) => {
            hideFogLoading()
            if (orderData && orderData.order && orderData.order.increment_id) {
                setOrderIncrementId(orderData.order.increment_id)
            }
        })
    }

    return (
        <div className="container thankyou-ctn" style={{ marginTop: 40 }}>
            {TitleHelper.renderMetaHeader({
                title: Identify.__('Thank you for your purchase!')
            })}
            <div className="root">
                <div className="body">
                    <h2 className='header'>{Identify.__('Thank you for your purchase!')}</h2>
                    {orderIncrementId ? <div className='order-id'>{Identify.__("Order your number is #%s").replace('%s', orderIncrementId)}</div> : ''}
                    <div className='order-message'>{Identify.__("We'll email you an order confirmation with details and tracking info.")}</div>
                    {(orderIncrementId && isSignedIn) &&
                        <Colorbtn
                            onClick={handleViewOrderDetails}
                            text={"View order details"}
                            className="thankyou-action view-details" />
                    }
                    <Colorbtn
                        onClick={() => {
                            history.push('/')
                            smoothScrollToView($("#root"));
                        }
                        }
                        text={"Continue Shopping"}
                        className="thankyou-action" />
                </div>
            </div>
        </div>
    );
};


const mapStateToProps = state => {
    const { user } = state;
    const { isSignedIn } = user;
    return {
        isSignedIn
    };
}

const mapDispatchToProps = {
    resetCheckout,
    getCartDetails
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Thankyou);
