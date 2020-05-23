import React from 'react';
import PropTypes from 'prop-types';
import ReactHTMLParse from 'react-html-parser'
import Price from 'src/simi/App/datn/BaseComponents/Price';
import { prepareProduct } from 'src/simi/Helper/Product'
import { analyticClickGTM, analyticAddCartGTM } from 'src/simi/Helper/Analytics'
import LazyLoad from 'react-lazyload';
import Image from 'src/simi/BaseComponents/Image'
import { StaticRate } from 'src/simi/BaseComponents/Rate'
import Identify from 'src/simi/Helper/Identify'
import { productUrlSuffix, saveDataToUrl, logoUrl } from 'src/simi/Helper/Url';
import { Colorbtn } from 'src/simi/BaseComponents/Button'
import QuickView from 'src/simi/App/datn/BaseComponents/QuickView';
import { addToWishlist as simiAddToWishlist } from 'src/simi/Model/Wishlist';
import { Util } from '@magento/peregrine';
const { BrowserPersistence } = Util;
import { showToastMessage } from 'src/simi/Helper/Message';
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading';
import { addToCart as simiAddToCart } from 'src/simi/Model/Cart';
import { getProductDetail } from 'src/simi/Model/Product';
import { withRouter } from 'react-router-dom';
import { getCartDetails } from 'src/actions/cart';
import { connect, Link } from 'src/drivers';
import { compose } from 'redux';
import { smoothScrollToView } from 'src/simi/Helper/Behavior';
import defaultClasses from './item.css'
import { mergeClasses } from 'src/classify'
import { toggleMessages } from 'src/simi/Redux/actions/simiactions';
import { showToastSuccess } from 'src/simi/Helper/MessageSuccess';

const $ = window.$;
require('./item.scss')


class Griditem extends React.Component {
    constructor(props) {
        super(props)
        const isPhone = window.innerWidth < 1024
        this.state = ({
            openModal: false,
            isPhone: isPhone,
        })
        this.vendorName = ''
        this.inWishList = false
        this.setIsPhone()
    }

    setIsPhone() {
        const obj = this;
        $(window).resize(function () {
            const width = window.innerWidth;
            const isPhone = width < 1024;
            if (obj.state.isPhone !== isPhone) {
                obj.setState({ isPhone })
            }
        })
    }

    addToCart = (pre_order = false) => {
        const { item } = this.props
        if (item && item.simiExtraField && item.simiExtraField.attribute_values) {
            const { attribute_values } = item.simiExtraField
            if ((!parseInt(attribute_values.has_options)) && attribute_values.type_id === 'simple') {
                const params = { product: String(item.id), qty: '1' }
                if (pre_order)
                    params.pre_order = 1
                showFogLoading()
                simiAddToCart(this.addToCartCallBack, params)
                return
            }
        }
        const { url_key } = item
        const { history } = this.props
        const product_url = `/${url_key}${productUrlSuffix()}`
        history.push(product_url)
    }

    addToCartCallBack = (data) => {
        hideFogLoading()
        if (data.errors) {
            let message = ''
            data.errors.map(value => {
                message += value.message
            })
            showToastMessage(message ? message : Identify.__('Problem occurred.'))
        } else {
            if (data.message)
                showToastSuccess(data.message)
            smoothScrollToView($("#root"));
            this.props.getCartDetails()
            const item = prepareProduct(this.props.item)
            analyticAddCartGTM(item.name, item.id, item.price)
        }
    }

    addToWishlist = () => {
        const storage = new BrowserPersistence()
        const isSignedIn = storage.getItem('signin_token')
        const { item } = this.props
        if (!isSignedIn) {
            showToastMessage(Identify.__('You must login or register to add items to your wishlist.'))
        } else if (item && item.id) {
            const params = { product: String(item.id), qty: '1' }
            showFogLoading()
            simiAddToWishlist(this.addToWishlistCallBack, params)
        }
    }

    addToWishlistCallBack = (data) => {
        hideFogLoading()
        if (data.errors) {
            showToastMessage(Identify.__('Problem occurred.'))
        } else {
            smoothScrollToView($('#id-message'));
            this.props.toggleMessages([{
                type: 'success',
                message: Identify.__('Add item into your wish list succesfully !'),
                auto_dismiss: true
            }])
            if (this.wlBtnRef) {
                this.wlBtnRef.classList.add("added-item")
            }
            // re-render wish list
            this.props.reRenderWL()
        }
    }

    addToCompare = () => {
        const { item } = this.props;
        const storeageData = Identify.getDataFromStoreage(Identify.LOCAL_STOREAGE, 'compare_product');
        let compareProducts;
        if (storeageData) {
            compareProducts = storeageData;
            const result = compareProducts.find(product => product.entity_id == item.id)
            if (result) {
                showToastMessage(Identify.__('Product has already added'.toUpperCase()))
            } else {
                showFogLoading()
                getProductDetail(this.compareCallBack, item.id)
            }
        } else {
            showFogLoading()
            getProductDetail(this.compareCallBack, item.id)
        }
    }

    compareCallBack = (data) => {
        const storeageData = Identify.getDataFromStoreage(Identify.LOCAL_STOREAGE, 'compare_product');
        let compareProducts;

        if (storeageData) {
            compareProducts = storeageData;
            compareProducts.push(data.product);
            Identify.storeDataToStoreage(Identify.LOCAL_STOREAGE, 'compare_product', compareProducts);
            showToastMessage(Identify.__('Product has added to your compare list'.toUpperCase()))
            hideFogLoading()
            this.props.updateCompare()
        } else {
            compareProducts = [];
            compareProducts.push(data.product);
            Identify.storeDataToStoreage(Identify.LOCAL_STOREAGE, 'compare_product', compareProducts);
            showToastMessage(Identify.__('Product has added to your compare list'.toUpperCase()))
            hideFogLoading()
            this.props.updateCompare()
            // document.getElementById('compare-list-product').style.display = 'inline';
        }
    }

    showUserAction = (id) => {
        $(`.user-action-${id}`).css('opacity', '1')
    }
    hideUserAction = (id) => {
        $(`.user-action-${id}`).css('opacity', '0')
    }
    showModalQuickView = () => {
        this.setState({
            openModal: true
        })
    }
    closeModal = () => {
        this.setState({
            openModal: false
        })
    }

    smootScollToMain = () => {
        smoothScrollToView($('#siminia-main-page'));
    }

    renderDiscountPercentAndOutOfStock = (item) => {
        // if out of stock => not show discount percent and vice versa
        if (item && item.simiExtraField && item.simiExtraField.attribute_values && parseInt(item.simiExtraField.attribute_values.is_salable) === 1) {
            // instock
            if (item && item.price && item.price.has_special_price && item.price.discount_percent && parseInt(item.price.discount_percent) > 0) {
                // has discount => render discount label
                return (
                    <div className="discount-label">
                        <div className="discount-value">
                            -{parseInt(item.price.discount_percent)}%
                        </div>
                    </div>
                )
            }
        } else {
            return (
                <div className="outstock-label">
                    <div className="stock-status">
                        Out of Stock
                    </div>
                </div>
            )
        }

    }

    renderActionCartMobile = (item) => {
        const { addToCart } = this
        return (
            item && item.simiExtraField && item.simiExtraField.attribute_values && parseInt(item.simiExtraField.attribute_values.is_salable) === 1 &&
            <div className="cartActionMobile"
                role="presentation"
                onClick={addToCart}
            >
                <span className="add-to-cart-btn icon-bag2"></span>
            </div>
        )
    }

    renderWishlistAction = (item) => {
        if (this.props.wlitems && this.props.wlitems.length) {
            for (let i = 0; i < this.props.wlitems.length; i++) {
                if (parseInt(this.props.wlitems[i].product_id) === item.id) {
                    this.inWishList = true
                    break
                }
            }
        }

        return (
            <div className="action-wishlist"
                role="presentation"
                onClick={this.addToWishlist}
            >
                <span
                    ref={(item) => { this.wlBtnRef = item }}
                    className={`add-to-wishlist icon-heart ${this.inWishList ? 'added-item' : 'normal-item'}`}
                ></span>
            </div>
        )
    }

    renderUserAction = (item) => {
        const { id } = item
        const { addToCart, addToCompare } = this
        return (
            <div className={`user-action user-action-${id}`}>
                {item && item.simiExtraField && item.simiExtraField.attribute_values && parseInt(item.simiExtraField.attribute_values.is_salable) === 1 &&
                    <div className="cartAction action">
                        <div className="cart sub-action">
                            <span
                                role="presentation"
                                className="add-to-cart-btn icon-bag2"
                                onClick={addToCart}
                            >
                            </span>
                        </div>
                    </div>}
                {/* <div className="quickViewAction action">
                    <div className="quick-view sub-action">
                        <span
                            role="presentation"
                            className="quick-view-btn icon-eye"
                            onClick={() => this.showModalQuickView()}
                        >
                        </span>
                    </div>
                </div> */}
                {!this.state.isPhone &&
                    <div className="compareAction action">
                        <div className="compare sub-action">
                            <span
                                role="presentation"
                                className="add-to-compare-btn icon-sync2"
                                onClick={() => {
                                    addToCompare();
                                }}
                            >
                            </span>
                        </div>
                    </div>
                }
            </div>
        )
    }

    render() {
        const { props, classes } = this
        const item = prepareProduct(props.item)
        const logo_url = logoUrl()
        if (!item) return '';
        const itemClasses = mergeClasses(defaultClasses, classes);
        const { name, url_key, id, price, type_id, small_image } = item
        const product_url = `/${url_key}${productUrlSuffix()}`
        saveDataToUrl(product_url, item)
        const location = {
            pathname: product_url,
            state: {
                product_id: id,
                item_data: item
            },
        }

        const image = (
            <div
                role="presentation"
                className="siminia-product-image"
                style={{
                    backgroundColor: 'white'
                }}
                onMouseOver={(e) => this.showUserAction(id)}
                onFocus={(e) => this.showUserAction(id)}
                onMouseOut={(e) => this.hideUserAction(id)}
                onBlur={(e) => this.hideUserAction(id)}
            >
                <div
                    style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%' }}>
                    <Link to={location}>
                        {<Image className={`img-${id}`} src={small_image} alt={name} />}
                    </Link>
                </div>
                {this.renderDiscountPercentAndOutOfStock(item)}
                {this.state.isPhone && this.renderActionCartMobile(item)}
                {this.renderWishlistAction(item)}
                {!this.state.isPhone && this.renderUserAction(item)}
            </div>
        )

        return (
            <div role="presentation" className="siminia-product-grid-item" onClick={() => { analyticClickGTM(name, item.id, item.price) }}>
                <QuickView openModal={this.state.openModal} closeModal={this.closeModal} product={item} />
                <div style={{ position: 'relative' }} className="grid-item-image">
                    {
                        props.lazyImage ?
                            (<LazyLoad placeholder={<img alt={name} src={logo_url} style={{ maxWidth: 60, maxHeight: 60 }} />}>
                                {image}
                            </LazyLoad>) :
                            image
                    }
                </div>

                <div className="siminia-product-des">
                    <div className="product-des-info">
                        <div className="product-name">
                            <div role="presentation" className="product-name small"
                                onClick={() => { props.handleLink(location) }} >{ReactHTMLParse(name)}</div>
                        </div>
                        {
                            (item.simiExtraField && item.simiExtraField.app_reviews) &&
                            (
                                <div className={itemClasses["item-review-rate"]}>
                                    <StaticRate rate={item.simiExtraField.app_reviews.rate} size={15} classes={itemClasses} backgroundColor={'#B91C1C'} />
                                    <div className={itemClasses["item-review-count"]}>({item.simiExtraField.app_reviews.number})</div>
                                </div>
                            )
                        }
                        <div className="price-each-product">
                            <div role="presentation" className={`prices-layout ${Identify.isRtl() ? "prices-layout-rtl" : ''}`} id={`price-${id}`}
                                onClick={() => { props.handleLink(location) }}>
                                <Price
                                    prices={price} type={type_id}
                                />
                            </div>
                        </div>
                    </div>
                    {/* <div className="cart-wishlish-compare">
                        {addToCartBtn}
                        {!this.state.isPhone && this.wishlistCompareAction()}
                    </div> */}
                </div>
            </div>
        )
    }
}

Griditem.contextTypes = {
    item: PropTypes.object,
    handleLink: PropTypes.func,
    classes: PropTypes.object,
    lazyImage: PropTypes.bool,
}


const mapDispatchToProps = {
    getCartDetails,
    toggleMessages
};

export default compose(connect(
    null,
    mapDispatchToProps
), withRouter)
    (Griditem);
