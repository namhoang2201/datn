export { default as Navigation } from './navigation';

import { connect } from 'src/drivers';
import { closeDrawer } from 'src/actions/app';
import { getUserDetails } from 'src/actions/user';
import { createCart, getCartDetails } from 'src/actions/cart';
import Navigation from './navigation';

const mapStateToProps = ({ app, user, cart, simireducers }) => {
    const { currentUser, isSignedIn } = user;
    const { drawer } = app
    const { cartId } = cart
    const { storeConfig } = simireducers;
    return {
        drawer,
        currentUser,
        isSignedIn,
        cartId,
        storeConfig
    }
}
const mapDispatchToProps = {
    closeDrawer,
    getUserDetails,
    createCart,
    getCartDetails
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Navigation);
