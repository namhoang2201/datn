import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import TitleHelper from 'src/simi/Helper/TitleHelper';
import Identify from 'src/simi/Helper/Identify';
import OrderSummary from "./OrderSummary/index";
import { Colorbtn } from 'src/simi/BaseComponents/Button';
import isObjectEmpty from 'src/util/isObjectEmpty';
import EditableForm from './editableForm';
import Panel from 'src/simi/BaseComponents/Panel';
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading';
import { smoothScrollToView } from 'src/simi/Helper/Behavior';
import Coupon from 'src/simi/BaseComponents/Coupon';
import ShippingForm from './ShippingForm';
import PaymentsForm from './PaymentsForm/PaymentsForm';

const $ = window.$

class Checkout extends Component {
    constructor(...args) {
        super(...args);
        const storeConfig = Identify.getStoreConfig();
        this.checkoutRedirect(storeConfig);
    }

    shouldComponentUpdate(nextProps) {
        if (this.showAPIloading(nextProps)) {
            showFogLoading()
            return false
        }
        hideFogLoading()
        return true
    }

    componentDidMount() {
        const { props } = this;
        const { beginCheckout, getCartDetails } = props;
        try {
            // get cart detail
            getCartDetails();
            //beginning checkout
            beginCheckout();
        } catch (err) {
            console.warn(err)
        }
    }

    componentDidUpdate() {
        const { submitPaymentMethod, cart } = this.props
        const params = new URLSearchParams(window.location.search)
        const query = {}
        for (const param of params.entries()) {
            const [key, value] = param;
            query[key] = value
        }
        const cc_3DSecure_stripe = Identify.getDataFromStoreage(Identify.SESSION_STOREAGE, 'cc_3DSecure_stripe');
        if (!this.submited3dStripe &&
            cart && cart.cartId &&
            query.hasOwnProperty('confirmed_3d_secure') &&
            query.confirmed_3d_secure === 'stripe' && cc_3DSecure_stripe
            && !isObjectEmpty(cc_3DSecure_stripe)) {
            cc_3DSecure_stripe.data['three_d_client_secret'] = query.client_secret;
            cc_3DSecure_stripe.data['three_d_src'] = query.source;
            this.submited3dStripe = true
            submitPaymentMethod(cc_3DSecure_stripe);
        }
    }
    get is_virtual() {
        const { cart } = this.props
        return cart.is_virtual || (cart.details && cart.details.is_virtual)
    }

    showAPIloading = (props) => {
        const { cart, history } = props;
        const { cartId, isLoading } = cart;
        const hasCart = cart && cart.details && cart.details.items
        if (hasCart) {
            if (!cart.details.items.length)
                history.push('/')
        }
        const cartLoading = (!hasCart && cartId && (!cart.details || !cart.details.items)) || isLoading
        if (cartLoading)
            return true
        if (props.checkout && props.checkout.submitting)
            return true
        if (props.simiCheckoutUpdating)
            return true
        return false
    }

    isCheckoutReady = checkout => {
        const { billingAddress, paymentData, shippingAddress, shippingMethod } = checkout;
        const { is_virtual } = this
        const objectsToCheck = [
            billingAddress,
            paymentData,
        ]
        if (!is_virtual)
            objectsToCheck.push(shippingAddress)
        const objectsHaveData = objectsToCheck.every(data => {
            return !!data && !isObjectEmpty(data);
        });
        const stringsHaveData = shippingMethod && shippingMethod.length > 0
        return objectsHaveData && (is_virtual || stringsHaveData)
    };


    placeOrder = () => {
        const { submitOrder, checkout, toggleMessages, history, cart } = this.props;
        const { paymentData, shippingAddress, shippingMethod, billingAddress } = checkout;
        const { is_virtual } = this

        if (toggleMessages) {
            if (!is_virtual && (!shippingAddress || isObjectEmpty(shippingAddress))) {
                smoothScrollToView($("#id-message"));
                toggleMessages([{ type: 'error', message: Identify.__('Please choose a shipping address'), auto_dismiss: true }])
                return;
            }
            if (!billingAddress || isObjectEmpty(billingAddress)) {
                smoothScrollToView($("#id-message"));
                toggleMessages([{ type: 'error', message: Identify.__('Please choose a billing address'), auto_dismiss: true }])
                return;
            }
            if (!is_virtual && (!shippingMethod || !shippingMethod.length)) {
                smoothScrollToView($("#id-message"));
                toggleMessages([{ type: 'error', message: Identify.__('Please choose a shipping method '), auto_dismiss: true }])
                return;
            }
            if (!paymentData || isObjectEmpty(paymentData)) {
                smoothScrollToView($("#id-message"));
                toggleMessages([{ type: 'error', message: Identify.__('Please choose a payment method'), auto_dismiss: true }])
                return;
            }
        }
        //save to show on thank you page
        Identify.storeDataToStoreage(Identify.LOCAL_STOREAGE, 'last_cart_info', { cart });
        if (paymentData && paymentData.value === 'paypal_express')
            history.push('/paypal_express.html')
        else {
            submitOrder();
        }
    }

    btnPlaceOrder = () => {
        const isCheckoutReady = this.isCheckoutReady(this.props.checkout)
        const obj = this
        return (
            <div className='btn-place-order'>
                <div
                    role="presentation"
                    className={`go-place_order ${isCheckoutReady ? 'ready' : 'not-ready'}`}
                    onClick={(e) => {
                        if (isCheckoutReady && e &&
                            e.target && !$(e.target).hasClass("not-ready") &&
                            !$(e.target).hasClass("payment-not-ready")
                            ) {
                            obj.placeOrder()
                        }
                    }}
                >{Identify.__('PLACE ORDER')}</div>
            </div>
        )
    }

    checkoutRedirect = (merchant) => {
        const { is_virtual } = this
        const { user, history } = this.props;
        const { isSignedIn } = user;

        const guest_checkout = merchant && merchant.simiStoreConfig.config.checkout.enable_guest_checkout ? merchant.simiStoreConfig.config.checkout.enable_guest_checkout : 1;
        if (!isSignedIn &&
            (
                (parseInt(guest_checkout, 10) === 0) ||
                is_virtual
            )
        ) {
            const location = {
                pathname: '/login.html',
                pushTo: '/checkout.html'
            };
            history.push(location);
        }
    }

    get checkoutInner() {
        const { props, is_virtual } = this;
        const { cart, checkout, submitShippingMethod, submitShippingAddress,
            submitPaymentMethod, submitBillingAddress, user, simiSignedIn,
            toggleMessages, getCartDetails } = props;
        const { shippingAddress, submitting, availableShippingMethods, shippingMethod,
            billingAddress, paymentData, paymentCode, invalidAddressMessage,
            isAddressInvalid, editing } = checkout;
        const { paymentMethods } = cart;
        const stepProps = {
            billingAddress, editing,
            invalidAddressMessage, isAddressInvalid, is_virtual,
            shippingAddress, simiSignedIn, submitShippingAddress,
            submitBillingAddress, submitting, toggleMessages, user,
        };

        const cartCurrencyCode = (cart && cart.details && cart.details.currency &&
            cart.details.currency.quote_currency_code)

        let cpValue = "";
        if (cart.totals.coupon_code) {
            cpValue = cart.totals.coupon_code;
        }

        const childCPProps = {
            value: cpValue,
            toggleMessages,
            getCartDetails
        }

        if (checkout.step && checkout.step === 'receipt' && checkout.order_entity_id) {
            sessionStorage.removeItem('cc_card_data');
            sessionStorage.removeItem('cc_3DSecure_stripe');
            this.props.history.push('/thankyou.html?order_entity_id=' + checkout.order_entity_id)
            return ''
        }

        if (!this.props.cart || !this.props.cart.cartId)
            return ''

        const btnPlaceOrder = this.btnPlaceOrder()
        return <Fragment>
            <div className='checkout-page-title'>{Identify.__("Checkout")}</div>
            <div className='checkout-column'>
                <div className='checkout-col-1'>
                    {!is_virtual && <Panel title={<div className='checkout-section-title'>{Identify.__('Shipping Address')}</div>}
                        className='checkout-panel'
                        renderContent={<EditableForm {...stepProps} editing='shippingAddress' />}
                        isToggle={true}
                        expanded={true}
                        headerStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    />}
                    <Panel title={<div className='checkout-section-title'>{Identify.__('Billing Information')}</div>}
                        className='checkout-panel'
                        renderContent={<EditableForm {...stepProps} editing='billingAddress' />}
                        isToggle={true}
                        expanded={true}
                        headerStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    />
                </div>
                <div className='checkout-col-2'>
                    {(!is_virtual && shippingAddress) && <div className="checkout-shipping-method">
                        <div className='checkout-section-title'>{Identify.__('Shipping Method')}</div>
                        <ShippingForm
                            shippingMethod={shippingMethod}
                            availableShippingMethods={availableShippingMethods}
                            submitShippingMethod={submitShippingMethod}
                            cartCurrencyCode={cartCurrencyCode}
                        />
                    </div>}
                    <div className="checkout-payment-method">
                        <div className='checkout-section-title'>{Identify.__('Payment Method')}</div>
                        <PaymentsForm
                            paymentCode={paymentCode}
                            submitPaymentMethod={submitPaymentMethod}
                            paymentMethods={paymentMethods}
                            paymentData={paymentData}
                        />
                    </div>
                    <Panel title={<div className='checkout-section-title'>{Identify.__('Apply Discount Code')}</div>}
                        className='checkout-panel checkout-panel-coupon'
                        renderContent={<Coupon {...childCPProps} />}
                        isToggle={true}
                        expanded={false}
                        headerStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    />

                </div>
                <div className='checkout-col-3'>
                    <div className='col-3-content'>
                        <OrderSummary cart={cart} cartCurrencyCode={cartCurrencyCode} checkout={checkout}
                            panelClassName='checkout-panel' btnPlaceOrder={btnPlaceOrder} />
                    </div>
                </div>
            </div>
        </Fragment>
    }

    render() {
        return (
            <div className={`checkout-bg ${Identify.isRtl() ? 'checkout-bg-rtl' : ''}`}>
                <div className="container">
                    {TitleHelper.renderMetaHeader({
                        title: Identify.__('Checkout')
                    })}
                    {this.checkoutInner}
                </div>
            </div>
        );
    }
}

Checkout.propTypes = {
    beginCheckout: PropTypes.func,
    cart: PropTypes.shape({
        details: PropTypes.shape({
            items_count: PropTypes.number
        })
    }),
    checkout: PropTypes.shape({
        availableShippingMethods: PropTypes.array,
        billingAddress: PropTypes.object,
        invalidAddressMessage: PropTypes.string,
        isAddressInvalid: PropTypes.bool,
        paymentCode: PropTypes.string,
        paymentData: PropTypes.object,
        shippingAddress: PropTypes.object,
        shippingMethod: PropTypes.string,
        step: PropTypes.oneOf(['cart', 'form', 'receipt']).isRequired,
        submitting: PropTypes.bool
    }).isRequired,
    submitOrder: PropTypes.func,
    submitPaymentMethod: PropTypes.func,
    submitShippingAddress: PropTypes.func,
    submitShippingMethod: PropTypes.func,
    submitBillingAddress: PropTypes.func,
    user: PropTypes.object,
    simiSignedIn: PropTypes.func
};

export default Checkout;
