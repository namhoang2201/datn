import React, { Component } from 'react'
import Identify from 'src/simi/Helper/Identify'
import BasketIcon from "src/simi/App/datn/BaseComponents/Icon/Basket"

require ('./emptyCart.scss')

class EmptyMiniCart extends Component {
    continueShopping = () => {
        if (this.props.history) {
            this.props.history.push('/');
        }
        if (this.props.handleClickOutside) {
            this.props.handleClickOutside()
        }
    }

    render() {
        return (
            <div className={`empty_cart_root`}>
                <BasketIcon style={{height: '30px', width: '30px'}}/>
                <h3 className="emptyTitle">
                    {Identify.__('YOUR CART IS EMPTY')}
                </h3>
                <button onClick={this.continueShopping} className="continue">
                    <span>{Identify.__('Continue Shopping')}</span>
                </button>
            </div>
        );
    }
}

export default EmptyMiniCart;
