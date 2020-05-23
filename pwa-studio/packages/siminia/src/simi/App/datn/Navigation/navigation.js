import React from 'react';
import { withRouter } from 'react-router-dom';
import Identify from 'src/simi/Helper/Identify'
import LeftMenuContent from './LeftMenuContent'

require('./navigation.scss')

const Navigation = props => {
    const { isSignedIn, currentUser, getUserDetails, cartId } = props
    const storeConfig = Identify.getStoreConfig()
    if (storeConfig && storeConfig.simiStoreConfig) {
        if (isSignedIn && (!currentUser || !currentUser.email))
            getUserDetails();
        if (!cartId) {
            if (!isSignedIn)
                props.createCart() //create cart if empty
            else
                props.getCartDetails() //get cart if empty and logged int
        }
    } else
        return ''

    const {
        drawer,
    } = props;
    const isOpen = drawer === 'nav';
    const className = `${Identify.isRtl() && 'nav_rtl'} left-menu-root ${isOpen ? 'open' : ''}`;

    return (
        <aside id="left-menu" className={className}>
            <LeftMenuContent
                currentUser={currentUser}
                parent={this}
                isSignedIn={props.isSignedIn}
            />
        </aside>
    )
}

export default (withRouter)(Navigation);
