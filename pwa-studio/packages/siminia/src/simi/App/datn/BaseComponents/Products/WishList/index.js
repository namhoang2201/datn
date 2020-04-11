import React from 'react'
import Image from 'src/simi/BaseComponents/Image'
import { Link, connect } from 'src/drivers';
import Identify from 'src/simi/Helper/Identify'
import { addToCart as simiAddToCart } from 'src/simi/Model/Cart';
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading'
import { updateItemInCart } from 'src/actions/cart';
import { toggleMessages } from 'src/simi/Redux/actions/simiactions';
import { smoothScrollToView } from 'src/simi/Helper/Behavior';
import { formatPrice } from 'src/simi/Helper/Pricing';
import { productUrlSuffix } from 'src/simi/Helper/Url';
import ReactHTMLParse from 'react-html-parser'
import { removeWlItem } from 'src/simi/Model/Wishlist'
require('./wishlist.scss')

const WishListItem = (props) => {
    const { item } = props
    const product_url = `/${item.product_url_key}${productUrlSuffix()}`
    const location = {
        pathname: product_url
    }
    let stockAvai = false;
    if (item && item.stock_status) {
        stockAvai = true
    }

    const addToCart = () => {
        if (!stockAvai)
            return

        if (item && item.hasOwnProperty('type_id') && item.type_id !== "simple") {
            props.history.push(location)
            return;
        }
        showFogLoading()
        simiAddToCart(addToCartCallBack, { product: item.product_id })
    }

    const addToCartCallBack = (data) => {
        hideFogLoading();
        smoothScrollToView($('#root'))
        if (data.errors) {
            if (data.errors.length) {
                props.toggleMessages({
                    type: 'error',
                    message: Identify.__(data.errors[0]),
                    auto_dismiss: true
                })
            }
        } else {
            if (data.message) {
                // showToastMessage(Array.isArray(data.message) ? data.message[0] : data.message)
                props.toggleMessages([{
                    type: 'success',
                    message: Array.isArray(data.message) ? Identify.__(data.message[0]) : Identify.__(data.message),
                    auto_dismiss: true
                }])
            }
            props.updateItemInCart()
        }
    }

    const deleteWlItem = (itemId) => {
        showFogLoading()
        removeWlItem(itemId, deleteCallback)
    }

    const deleteCallback = (data) => {
        hideFogLoading();
        smoothScrollToView($('#root'))
        if (data.errors) {
            if (data.errors.length) {
                props.toggleMessages({
                    type: 'error',
                    message: Identify.__(data.errors[0]),
                    auto_dismiss: true
                })
            }
        } else {
            if (data.message) {
                // showToastMessage(Array.isArray(data.message) ? data.message[0] : data.message)
                props.toggleMessages([{
                    type: 'success',
                    message: Identify.__('Remove item from your wish list succesfully !'),
                    auto_dismiss: true
                }])
            }
            // re-render wish list
            props.reRenderWL()
        }
    }

    return (
        <div className="wl-item">
            <div className="wl-image">
                <Link to={location} >
                    <Image key={Identify.randomString('5')} className="img-responsive" src={item.product_image} alt={item.product_name} />
                </Link>
            </div>
            <div className="wl-item-des">
                <div className="wl-item-name" role="presentation" onClick={() => props.history.push(location)}>
                    {ReactHTMLParse(item.product_name)}
                </div>
                <div className="wl-item-price">
                    {item.is_show_price && item.app_prices && item.app_prices.price && formatPrice(parseFloat(item.app_prices.price))}
                </div>
                <div className="wl-add-to-cart" role="presentation" onClick={addToCart}>
                    <div className="text">{Identify.__('Add to cart')}</div>
                </div>
            </div>
            <div className="btn-close" role="presentation" onClick={() => deleteWlItem(parseInt(item.wishlist_item_id))}>
                <i className="icon-cross2"></i>
            </div>
        </div>
    )
}

const mapDispatchToProps = {
    updateItemInCart,
    toggleMessages
};

export default connect(
    null,
    mapDispatchToProps
)(WishListItem);