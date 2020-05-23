import React, { Component, Suspense } from 'react';
import { arrayOf, bool, number, shape, string, object } from 'prop-types';
import { smoothScrollToView } from 'src/simi/Helper/Behavior'
import Loading from 'src/simi/BaseComponents/Loading'
import { Colorbtn, Whitebtn } from 'src/simi/BaseComponents/Button'
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading'
import ProductImage from './ProductImage';
import Quantity from './ProductQuantity';
import isProductConfigurable from 'src/util/isProductConfigurable';
import Identify from 'src/simi/Helper/Identify';
import TitleHelper from 'src/simi/Helper/TitleHelper'
import { prepareProduct } from 'src/simi/Helper/Product'
import ProductPrice from '../Component/Productprice';
import { addToCart as simiAddToCart } from 'src/simi/Model/Cart';
import { addToWishlist as simiAddToWishlist } from 'src/simi/Model/Wishlist';
import { configColor } from 'src/simi/Config'
import { showToastMessage } from 'src/simi/Helper/Message';
import ReactHTMLParse from 'react-html-parser';
import BreadCrumb from 'src/simi/App/datn/BaseComponents/BreadCrumb'
import { TopReview, ReviewList, NewReview } from './Review/index'
import SocialShare from 'src/simi/BaseComponents/SocialShare';
import Description from './Description';
import Techspec from './Techspec';
import LinkedProduct from './LinkedProduct';
import Tabs from "src/simi/App/datn/BaseComponents/Tabs";
import { getProductDetail } from 'src/simi/Model/Product';
import CompareProduct from 'src/simi/App/datn/BaseComponents/CompareProducts';
import { showToastSuccess } from 'src/simi/Helper/MessageSuccess';

const ConfigurableOptions = React.lazy(() => import('./Options/ConfigurableOptions'));
const CustomOptions = React.lazy(() => import('./Options/CustomOptions'));
const BundleOptions = React.lazy(() => import('./Options/Bundle'));
const GroupedOptions = React.lazy(() => import('./Options/GroupedOptions'));
const DownloadableOptions = React.lazy(() => import('./Options/DownloadableOptions'));

require('./productFullDetail.scss');

const $ = window.$

class ProductFullDetail extends Component {
    state = {
        optionCodes: new Map(),
        optionSelections: new Map(),
        showModalCompare: false,
        isPhone: window.innerWidth < 1024
    };
    quantity = 1

    static getDerivedStateFromProps(props, state) {
        const { configurable_options } = props.product;
        const optionCodes = new Map(state.optionCodes);
        // if this is a simple product, do nothing
        if (!isProductConfigurable(props.product) || !configurable_options) {
            return null;
        }
        // otherwise, cache attribute codes to avoid lookup cost later
        for (const option of configurable_options) {
            optionCodes.set(option.attribute_id, option.attribute_code);
        }
        return { optionCodes };
    }

    setQuantity = quantity => this.quantity = quantity;

    prepareParams = () => {
        const { props, state, quantity } = this;
        const { optionSelections } = state;
        const { product } = props;

        const params = { product: String(product.id), qty: quantity ? String(quantity) : '1' }
        if (this.customOption) {
            const customOptParams = this.customOption.getParams()
            if (customOptParams && customOptParams.options) {
                params['options'] = customOptParams.options
            } else
                this.missingOption = true
        }
        if (this.bundleOption) {
            const bundleOptParams = this.bundleOption.getParams()
            if (bundleOptParams && bundleOptParams.bundle_option_qty && bundleOptParams.bundle_option) {
                params['bundle_option'] = bundleOptParams.bundle_option
                params['bundle_option_qty'] = bundleOptParams.bundle_option_qty
            }
        }
        if (this.groupedOption) {
            const groupedOptionParams = this.groupedOption.getParams()
            if (groupedOptionParams && groupedOptionParams.super_group) {
                params['super_group'] = groupedOptionParams.super_group
            }
        }
        if (this.downloadableOption) {
            const downloadableOption = this.downloadableOption.getParams()
            if (downloadableOption && downloadableOption.links) {
                params['links'] = downloadableOption.links
            } else
                this.missingOption = true
        }
        if (optionSelections && optionSelections.size) { //configurable option
            if (this.isMissingConfigurableOptions) {
                this.missingOption = true
            }
            const super_attribute = {}
            optionSelections.forEach((value, key) => {
                super_attribute[String(key)] = String(value)
            })
            params['super_attribute'] = super_attribute
        }
        return params
    }

    resizePhone = () => {
        window.onresize = () => {
            const isPhone = window.innerWidth < 1024;
            this.setState({ isPhone });
        }
    }
    componentDidMount() {
        this.resizePhone();
    }

    addToCart = () => {
        const { props } = this;
        const { product } = props;
        if (product && product.id) {
            this.missingOption = false
            const params = this.prepareParams()
            if (this.missingOption) {
                showToastMessage(Identify.__('Please select the options required (*)'));
                return
            }
            showFogLoading()
            simiAddToCart(this.addToCartCallBack, params)
        }
    };

    addToCartCallBack = (data) => {
        hideFogLoading()
        if (data.errors) {
            this.showError(data)
        } else {
            this.showSuccess(data)
            this.props.updateItemInCart()
        }
    }

    addToWishlist = () => {
        const { product, isSignedIn, history } = this.props;
        if (!isSignedIn) {
            history.push('/login.html')
        } else if (product && product.id) {
            this.missingOption = false
            const params = this.prepareParams()
            showFogLoading()
            simiAddToWishlist(this.addToWishlistCallBack, params)
        }
    }

    addToWishlistCallBack = (data) => {
        hideFogLoading()
        if (data.errors) {
            this.showError(data)
        } else {
            showToastSuccess('Product was added to your wishlist')
        }
    }

    addToCompare = () => {
        const { product } = this.props;
        const compareData = Identify.getDataFromStoreage(Identify.LOCAL_STOREAGE, 'compare_product');
        let compareProducts;
        if (compareData) {
            compareProducts = compareData;
            const result = compareProducts.find(item => item.entity_id == product.id)
            if (result) {
                this.showModalCompare();
                showToastMessage(Identify.__('Product exist in compare list!'))
            } else {
                showFogLoading();
                getProductDetail(this.compareCallBack, product.id)
            }
        } else {
            showFogLoading();
            getProductDetail(this.compareCallBack, product.id)
        }
    }

    showModalCompare = () => {
        this.setState({ showModalCompare: true });
    }

    closeModalCompare = () => {
        this.setState({ showModalCompare: false });
    }

    compareCallBack = (data) => {
        const compareData = Identify.getDataFromStoreage(Identify.LOCAL_STOREAGE, 'compare_product');
        let compareProducts;

        if (compareData) {
            compareProducts = compareData;
            compareProducts.push(data.product);
            Identify.storeDataToStoreage(Identify.LOCAL_STOREAGE, 'compare_product', compareProducts);
            showToastMessage(Identify.__('Product has added to your compare list'.toUpperCase()))
            hideFogLoading();
            this.showModalCompare();
        } else {
            compareProducts = [];
            compareProducts.push(data.product);
            Identify.storeDataToStoreage(Identify.LOCAL_STOREAGE, 'compare_product', compareProducts);
            showToastMessage(Identify.__('Product has added to your compare list'.toUpperCase()))
            hideFogLoading();
            document.getElementById('compare-list-product').style.display = 'inline';
            this.showModalCompare();
        }
    }

    showError(data) {
        smoothScrollToView($("#root"));
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
    }

    showSuccess(data) {
        if (data.message) {
            smoothScrollToView($("#root"));
            this.props.toggleMessages([{
                type: 'success',
                message: Array.isArray(data.message) ? data.message[0] : data.message,
                auto_dismiss: true
            }])
        }
    }

    handleConfigurableSelectionChange = (optionId, selection) => {
        this.setState(({ optionSelections }) => ({
            optionSelections: new Map(optionSelections).set(
                optionId,
                Array.from(selection).pop()
            )
        }));
    };

    get isMissingConfigurableOptions() {
        const { product } = this.props;
        const { configurable_options } = product;
        const numProductOptions = configurable_options.length;
        const numProductSelections = this.state.optionSelections.size;
        return numProductSelections < numProductOptions;
    }

    get fallback() {
        return <Loading />;
    }

    get productOptions() {
        const { fallback, handleConfigurableSelectionChange, props } = this;
        const { configurable_options, simiExtraField, type_id, is_dummy_data } = props.product;
        const isConfigurable = isProductConfigurable(props.product);
        if (is_dummy_data)
            return <Loading />
        return (
            <Suspense fallback={fallback}>
                {
                    isConfigurable &&
                    <ConfigurableOptions
                        options={configurable_options}
                        onSelectionChange={handleConfigurableSelectionChange}
                    />
                }
                {
                    type_id === 'bundle' &&
                    <BundleOptions
                        key={Identify.randomString(5)}
                        app_options={simiExtraField.app_options}
                        product_id={this.props.product.entity_id}
                        ref={e => this.bundleOption = e}
                        parent={this}
                    />
                }
                {
                    type_id === 'grouped' &&
                    <GroupedOptions
                        key={Identify.randomString(5)}
                        app_options={props.product.items ? props.product.items : []}
                        product_id={this.props.product.entity_id}
                        ref={e => this.groupedOption = e}
                        parent={this}
                    />
                }
                {
                    type_id === 'downloadable' &&
                    <DownloadableOptions
                        key={Identify.randomString(5)}
                        app_options={simiExtraField.app_options}
                        product_id={this.props.product.entity_id}
                        ref={e => this.downloadableOption = e}
                        parent={this}
                    />
                }
                {
                    (simiExtraField && simiExtraField.app_options && simiExtraField.app_options.custom_options) &&
                    <CustomOptions
                        key={Identify.randomString(5)}
                        app_options={simiExtraField.app_options}
                        product_id={this.props.product.entity_id}
                        ref={e => this.customOption = e}
                        parent={this}
                    />
                }
            </Suspense>
        );
    }

    breadcrumb = (product) => {
        const lastCateId = Identify.getDataFromStoreage(Identify.SESSION_STOREAGE, 'last_viewed_cate_id');
        const lastCatePathArray = Identify.getDataFromStoreage(Identify.SESSION_STOREAGE, 'last_viewed_cate_path_array');
        if (product && product.simiExtraField && product.simiExtraField.attribute_values &&
            product.simiExtraField.attribute_values.category_ids && Array.isArray(product.simiExtraField.attribute_values.category_ids)
        ) {
            if (product.simiExtraField.attribute_values.category_ids.includes(String(lastCateId))) {
                lastCatePathArray.push({ name: product.name })
                return <BreadCrumb breadcrumb={lastCatePathArray} history={this.props.history} />
            }
        }
        return <BreadCrumb breadcrumb={[{ name: 'Home', link: '/' }, { name: product.name }]} history={this.props.history} />
    }

    handleAddYourReview = () => {
        if (this.tabs) {
            this.tabs.openTab(2);
        }
    }

    render() {
        hideFogLoading()
        const { addToCart, productOptions, props, state, addToWishlist, addToCompare } = this;
        const { optionCodes, optionSelections, isPhone } = state
        const product = prepareProduct(props.product)
        const { type_id, name, simiExtraField, sku } = product;
        const short_desc = (product.short_description && product.short_description.html) ? product.short_description.html : ''
        const hasReview = simiExtraField && simiExtraField.app_reviews && simiExtraField.app_reviews.number;
        let stockLabel = '';
        let hasStock = true;
        if (simiExtraField) {
            if (parseInt(simiExtraField.attribute_values.is_salable, 10) !== 1) {
                stockLabel = Identify.__('Out of stock');
                hasStock = false
            } else {
                stockLabel = Identify.__('In stock');
                hasStock = true;
            }
        }

        return (
            <div className="container product-detail-root">
                {this.breadcrumb(product)}
                {TitleHelper.renderMetaHeader({
                    title: product.meta_title ? product.meta_title : product.name ? product.name : '',
                    desc: product.meta_description ? product.meta_description : product.description ? product.description : ''
                })}
                <div className="image-carousel">
                    <ProductImage
                        optionCodes={optionCodes}
                        optionSelections={optionSelections}
                        product={product}
                        showStatus={false}
                        hasStock={hasStock}
                    />
                </div>
                <div className="main-actions">
                    <div className="title">
                        <h1 className="product-name">
                            <span>{ReactHTMLParse(name)}</span>
                        </h1>
                    </div>
                    {sku &&
                        <div className={`product-sku flex`} id="product-sku">
                            <span className='sku-label'>{Identify.__('Sku') + ": "} {sku}</span>
                        </div>
                    }
                    <div role="presentation" className="review-btn" onClick={this.handleAddYourReview}>
                        {Identify.__('Be the first to review this product')}
                    </div>
                    {hasReview ? <div className="top-review"><TopReview app_reviews={product.simiExtraField.app_reviews} />
                        {stockLabel && <div className="product-stock-status">{stockLabel}</div>}
                    </div> : ''}
                    <div className="product-price">
                        <ProductPrice ref={(price) => this.Price = price} data={product} configurableOptionSelection={optionSelections} />
                    </div>
                    <div className="product-short-desc">{ReactHTMLParse(short_desc)}</div>
                    <div className="options">{productOptions}</div>
                    {
                        type_id !== 'grouped' && hasStock ?
                            <div className="product-qty-content">
                                <span className="amount-qty">{Identify.__("Amount")}</span>
                                <Quantity
                                    initialValue={this.quantity}
                                    onValueChange={this.setQuantity}
                                />
                            </div> : ''
                    }
                    <div className="cart-actions">
                        <div
                            className="add-to-cart-ctn"
                            style={{
                                borderColor: configColor.button_background, borderWidth: '1px', borderStyle: 'solid'
                            }}>
                            <Colorbtn
                                style={{ backgroundColor: configColor.button_background, color: configColor.button_text_color }}
                                className="add-to-cart-btn"
                                onClick={addToCart}
                                text={Identify.__('Add to Cart')} />
                        </div>
                        <div className="wishlist-actions" onClick={addToWishlist}>
                            <span className="icon-heart" />
                        </div>
                        <div className="compare-actions">
                            <div onClick={addToCompare}>
                                <span className="icon-sync" />
                            </div>
                            <CompareProduct openModal={this.state.showModalCompare} closeModal={this.closeModalCompare} history={this.props.history} />
                        </div>

                    </div>
                    {/* <div className="social-share"><SocialShare id={product.id} className="social-share-item" /></div> */}
                </div>
                <div className="product-informations">
                    <Tabs activeItem={0}
                        scrollTo={() => smoothScrollToView($('#product-detail-new-review'))}
                        objRef={(tabs) => this.tabs = tabs}>
                        <div label={Identify.__('Detail')}>
                            {product.description && <div className="description"><Description product={product} /></div>}
                        </div>
                        <div label={Identify.__('More Information')}>
                            {(simiExtraField && simiExtraField.additional && Object.keys(simiExtraField.additional).length) ? <div className="techspec"><Techspec product={product} /></div> : ''}
                        </div>
                        <div label={Identify.__('Reviews')}>
                            <div className="review-list"><ReviewList product_id={product.id} /></div>
                            <div className="new-review" id="product-detail-new-review">
                                <NewReview product={product} toggleMessages={this.props.toggleMessages} />
                            </div>
                        </div>
                    </Tabs>
                </div >
                <LinkedProduct product={product} link_type="related" history={this.props.history} showCarousel={true} isPhone={isPhone} />
                {/* <LinkedProduct product={product} link_type="crosssell" history={this.props.history} /> */}
            </div >
        );
    }
}

ProductFullDetail.propTypes = {
    product: shape({
        __typename: string,
        id: number,
        sku: string.isRequired,
        price: shape({
            regularPrice: shape({
                amount: shape({
                    currency: string.isRequired,
                    value: number.isRequired
                })
            }).isRequired
        }).isRequired,
        media_gallery_entries: arrayOf(
            shape({
                label: string,
                position: number,
                disabled: bool,
                file: string.isRequired
            })
        ),
        description: object
    }).isRequired
};

export default ProductFullDetail;
