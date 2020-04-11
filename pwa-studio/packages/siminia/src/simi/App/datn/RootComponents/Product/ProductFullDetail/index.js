import ProductFullDetail from './ProductFullDetail';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { connect } from 'src/drivers';
import { addItemToCart, updateItemInCart } from 'src/actions/cart';
import { toggleMessages, simiSignedIn } from 'src/simi/Redux/actions/simiactions';

const mapDispatchToProps = {
    addItemToCart,
    updateItemInCart,
    toggleMessages,
    simiSignedIn
};

const mapStateToProps = ({ user, cart }) => {
    const { isSignedIn, currentUser } = user;
    const { cartId } = cart
    return {
        isSignedIn,
        cartId,
        currentUser
    };
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(ProductFullDetail);
