import React from "react";
import Identify from "src/simi/Helper/Identify";
import {Colorbtn} from 'src/simi/BaseComponents/Button'
import {configColor} from 'src/simi/Config'
import ReactHTMLParse from 'react-html-parser';
import { Link } from 'src/drivers';
import Trash from 'src/simi/BaseComponents/Icon/Trash';
import { removeWlItem, addWlItemToCart } from 'src/simi/Model/Wishlist'
import {hideFogLoading, showFogLoading} from 'src/simi/BaseComponents/Loading/GlobalLoading'
import { resourceUrl } from 'src/simi/Helper/Url'
import { formatPrice } from 'src/simi/Helper/Pricing';
import Image from 'src/simi/BaseComponents/Image'
import {productUrlSuffix} from 'src/simi/Helper/Url';
import QuickView from 'src/simi/App/datn/BaseComponents/QuickView'
import { getProductDetail } from 'src/simi/Model/Product';
import { showToastMessage } from 'src/simi/Helper/Message';

class Item extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            openModal: false
        }
    }
    processData(data) {
        hideFogLoading()
        if (data.errors) {
            if (data.errors.length) {
                const errors = data.errors.map(error => {
                    return {
                        type: 'error',
                        message: error.message,
                        auto_dismiss: true
                    }
                });
                this.props.toggleMessages(errors)
            }
        } else if (this.addCart || this.removeItem) {
            if (this.addCart) {
                this.props.toggleMessages([{type: 'success', message: Identify.__('This product has been moved to cart'), auto_dismiss: true}])
                const { getCartDetails } = this.props;
                if (getCartDetails)
                    getCartDetails()
                showFogLoading()
                this.props.getWishlist()
            }
            if (this.removeItem) {
                this.props.toggleMessages([{type: 'success', message: Identify.__('This product has been removed from your wishlist'), auto_dismiss: true}])
                showFogLoading()
                this.props.getWishlist()
            }
        }

        this.addCart = false
        this.removeItem = false;
    }

    addToCart(id, location = false) {
        console.log('run');
        const item = this.props.item;
        if (item.type_id !== 'simple') {
            if (location)
                this.props.history.push(location)
            return
        }
        this.addCart = true;
        addWlItemToCart(id, this.processData.bind(this))
    }

    onTrashItem = (id) => {
        if(id){
            if (confirm(Identify.__('Are you sure you want to delete this product?')) == true) {
                this.handleTrashItem(id)
            }
        }
    }

    handleTrashItem = (id) => {
        showFogLoading();
        this.removeItem = true;
        removeWlItem(id, this.processData.bind(this))
    }

    handleQuickView = () => {
        this.setState({openModal: !this.state.openModal})
    }

    handleCloseModel = () => {
        this.setState({openModal: false})
    }

    addToCompare = () => {
        const { item } = this.props;
        const storeageData = Identify.getDataFromStoreage(Identify.LOCAL_STOREAGE, 'compare_product');
        if (storeageData) {
            const result = storeageData.find(product => product && product.entity_id == item.product_id)
            if (result) {
                showToastMessage(Identify.__('Product has already added'.toUpperCase()))
            } else {
                showFogLoading()
                getProductDetail(this.compareCallBack, item.product_id)
            }
        } else {
            showFogLoading()
            getProductDetail(this.compareCallBack, item.product_id)
        }
    }

    compareCallBack = (data) => {
        const storeageData = Identify.getDataFromStoreage(Identify.LOCAL_STOREAGE, 'compare_product');
        let compareProducts = [];
        if(storeageData) compareProducts = storeageData;

        compareProducts.push(data.product);
        Identify.storeDataToStoreage(Identify.LOCAL_STOREAGE, 'compare_product', compareProducts);
        showToastMessage(Identify.__('Product has added to your compare list'.toUpperCase()))
        hideFogLoading()
    }

    render() {
        const storeConfig = Identify.getStoreConfig()
        const {openModal} = this.state;
        if (!this.currencyCode)
            this.currencyCode = storeConfig?storeConfig.simiStoreConfig?storeConfig.simiStoreConfig.currency:storeConfig.storeConfig.default_display_currency_code:null
        const {item, classes} = this.props;
        this.location = {
            pathname: '/' + item.product_url_key + productUrlSuffix(),
            state: {
                product_sku: item.product_sku,
                product_id: item.product_id,
                item_data: item
            },
        }
        
        const image = item.product_image && (
            <div className="product-image">
                
                    <div className="wishlist-image">
                        <Link to={this.location}>
                            <Image src={resourceUrl(item.product_image, {
                                type: 'image-product',
                                width: 100
                            })} alt={item.product_name}/>
                        </Link>
                        <div className="my-wishlist-action">
                            <div className="add-to-cart" onClick={() => this.addToCart(item.wishlist_item_id, this.location)}>
                                <i className="icon icon-bag2"></i>
                            </div>
                            <div className="quickview" onClick={this.handleQuickView}>
                                <i className="icon icon-eye"></i>
                            </div>
                            <div className="compare" onClick={this.addToCompare}>
                                <i className="icon icon-sync2" ></i>
                            </div>
                            <div className="delete" onClick={() => this.handleTrashItem(item.wishlist_item_id)}>
                                <i className="icon icon-trash" ></i>
                            </div>
                        </div>
                    </div>
                
            </div>
        );
        
        return (
            <div className={`product-item product-grid-item`}>
                {image}
                <div className="product-des">
                    <Link to={this.location} className="product-name">{ReactHTMLParse(item.product_name)}</Link>
                    <div 
                        className="prices-layout"
                        id={`price-${item.product_id}`} 
                        style={{color: configColor.price_color}}>
                        {formatPrice(parseFloat(item.product_price))}
                    </div>
                </div>
                {openModal && <QuickView openModal={openModal} product={item} handleCloseModel={this.handleCloseModel} />}
            </div>
        );
    }
}

export default Item