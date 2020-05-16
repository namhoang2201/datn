import Checkout from './checkout';

import { connect } from 'src/drivers';
import { submitPaymentMethod } from 'src/actions/checkout';
import {
    getCartDetails
} from 'src/actions/cart';
import {
    toggleMessages, simiSignedIn, 
    beginCheckout, submitShippingAddress, submitBillingAddress, submitOrder, submitShippingMethod
} from 'src/simi/Redux/actions/simiactions';

require('./checkout.scss')

const mapStateToProps = ({ cart, checkout, user, simireducers }) =>  {
    const { simiCheckoutUpdating } = simireducers;
    return {
        cart,
        checkout,
        user,
        simiCheckoutUpdating
    }
}

const mapDispatchToProps = {
    getCartDetails,
    beginCheckout,
    submitShippingAddress,
    submitOrder,
    submitShippingMethod,
    submitBillingAddress,
    submitPaymentMethod,
    toggleMessages,
    simiSignedIn
};


export default connect(mapStateToProps, mapDispatchToProps)(Checkout);