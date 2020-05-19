import React from 'react'
import Identify from "src/simi/Helper/Identify"
import CateTree from 'src/simi/App/core/Navigation/Dashboardmenu/CateTree'
import LeftMenuAccount from './LeftMenuAccount';
import Storeview from "src/simi/BaseComponents/Settings/Storeview";
import Currency from "src/simi/BaseComponents/Settings/Currency"
import { toggleDrawer, closeDrawer } from 'src/actions/app';
import { connect } from 'src/drivers';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';
import Modal from 'react-responsive-modal';
import { showToastMessage } from 'src/simi/Helper/Message';
import { showToastSuccess } from 'src/simi/Helper/MessageSuccess';
import ScanGo from './ScanGo';
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading';
import { getProductDetail } from 'src/simi/Model/Product';
import { addToCart as simiAddToCart } from 'src/simi/Model/Cart';
import { productUrlSuffix } from 'src/simi/Helper/Url';
import { smoothScrollToView } from 'src/simi/Helper/Behavior';
import {
    updateItemInCart
} from 'src/actions/cart';
import { toggleMessages } from 'src/simi/Redux/actions/simiactions';

class LeftMenuContent extends React.Component {

    constructor(props) {
        super(props);
        this.parent = this.props.parent;
        this.state = ({
            product_id: null,
            resultScan: null,
            open: false
        })
    }

    onOpenModal = () => {
        if (
            navigator.mediaDevices &&
            typeof navigator.mediaDevices.getUserMedia === 'function'
        ) {
            this.setState({ open: true });
        } else {
            this.handleCloseMenu();
            showToastMessage('Your device does not support !');
        }
    };

    onCloseModal = () => {
        this.setState({ open: false });
        this.handleCloseMenu();
    };

    getBrowserHistory = () => {
        return this.props.history
    }

    handleLink = (link) => {
        this.getBrowserHistory().push(link);
        this.handleCloseMenu()
    }

    handleMenuItem = (item) => {
        if (item && item.url) {
            this.handleLink(item.url)
        } else if (item && item.pathname) {
            this.handleLink(item)
        }
    }

    handleShowMenu = () => {
        this.props.openNav()
    }

    handleCloseMenu = () => {
        this.props.hideNav()
    }

    renderSections() {
        const { isSignedIn } = this.props
        const merchantConfigs = Identify.getStoreConfig();
        return (
            <React.Fragment>
                <div className="left-cats-menu">
                    <div className="scan-go">
                        <button className="item" onClick={() => this.onOpenModal()}>
                            <i className="icon-frame-expand"></i>
                            <span>Scan Now</span>
                        </button>
                    </div>
                    <CateTree classes={{
                        'menu-content': 'menu-content',
                        'icon-menu': 'icon-menu',
                        'menu-title': 'menu-title',
                        'menu-cate-name-item': 'menu-cate-name-item',
                        'root-menu': 'root-menu',
                        'cate-parent-item': 'cate-parent-item',
                        'sub-cate-root': 'sub-cate-root',
                        'cate-child-item': 'cate-child-item',
                        'cate-icon': 'cate-icon',
                        'cate-root': 'cate-root',
                    }}
                        handleMenuItem={this.handleMenuItem.bind(this)} hideHeader={true} />
                </div>
                {isSignedIn
                    ?
                    <LeftMenuAccount handleMenuItem={this.handleMenuItem.bind(this)} />
                    : null
                }
                {
                    merchantConfigs &&
                    <div className="left-store-switch">
                        <div className="storeview-switcher">
                            <Storeview classes={{}} className="storeview" />
                        </div>
                        <div className="currency-switcher">
                            <Currency classes={{}} className="currency" />
                        </div>
                    </div>
                }
                <div className="left-contact-us">
                    {Identify.__('Contact us 24/7: +84965351741')}
                </div>


                <div className="left-bottom-menu">
                    <div
                        role="presentation"
                        onClick={() => this.props.isSignedIn ? this.handleLink('/logout.html') : this.handleLink('/login.html')}>
                        {this.props.isSignedIn ? Identify.__('Logout') : Identify.__('Login')}
                    </div>
                </div>
            </React.Fragment>
        )
    }

    scanSuccess = data => {
        if (data) {
            this.onCloseModal()
            showFogLoading()
            // data is product_id
            this.setState({
                product_id: data,
                resultScan: data
            })
            getProductDetail(this.getDataCallback, data)
        }
    }
    scanFail = err => {
        console.log(err)
        this.onCloseModal()
    }

    getDataCallback = (data) => {
        hideFogLoading()
        if (data && data.product && data.product.entity_id
            && data.product.entity_id === this.state.product_id) {
            // add product to cart
            if (data.product.is_salable === 1) {
                // add product to cart
                if (data.product.type_id === "simple") {
                    showFogLoading()
                    const params = { product: String(data.product.entity_id), qty: '1' }
                    simiAddToCart(this.addToCartCallBack, params)
                } else {
                    // go to product detail page if product not simple
                    const product_url = `/${data.product.url_key}${productUrlSuffix()}`
                    smoothScrollToView($('#root'));
                    this.props.history.push(product_url)
                }
            } else {
                showToastMessage('Your product is out of stock !')
            }
        } else {
            showToastMessage('Cannot find any product with your QrCode: ' + this.state.resultScan)
        }
    }

    addToCartCallBack = (data) => {
        hideFogLoading()
        if (data.errors) {
            this.showError(data)
        } else {
            this.showSuccess(data)
            this.props.updateItemInCart()
            smoothScrollToView($('#root'));
        }
    }

    showSuccess(data) {
        if (data.message) {
            showToastSuccess(data.message[0])
        }
    }

    showError(data) {
        if (data.errors.length) {
            showToastMessage('Problem occurs !')
        }
    }

    render() {
        return (
            <div className="list-menu-header" style={{ maxHeight: window.innerHeight }}>
                <div className="left-top-menu">
                    {this.renderSections()}
                    <Modal
                        overlayId={'scango-modal-overlay'}
                        modalId={'scango-modal'}
                        open={this.state.open}
                        onClose={this.onCloseModal}
                    >
                        <div className="modal-header">
                            <h4 className="modal-title">QR Scanner</h4>
                        </div>
                        {/* <Start closeModal={this.onCloseModal} history={this.props.history} /> */}
                        <ScanGo
                            scanSuccess={this.scanSuccess}
                            scanFail={this.scanFail}
                        />
                    </Modal>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    openNav: () => dispatch(toggleDrawer('nav')),
    hideNav: () => dispatch(closeDrawer('nav')),
    toggleMessages: () => dispatch(toggleMessages()),
    updateItemInCart: () => dispatch(updateItemInCart())
});

const mapStateToProps = ({ user }) => {
    const { isSignedIn } = user
    return {
        isSignedIn
    };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(LeftMenuContent);
