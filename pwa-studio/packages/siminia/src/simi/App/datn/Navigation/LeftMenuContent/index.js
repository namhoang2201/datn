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
import ScanGo from './ScanGo';

class LeftMenuContent extends React.Component {

    constructor(props) {
        super(props);
        this.parent = this.props.parent;
    }
    state = {
        open: false
    };

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
                        handleMenuItem={this.handleMenuItem.bind(this)} hideHeader={false} />
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
                <div className="scan-go">
                    <button className="item" onClick={() => this.onOpenModal()}>
                        <i className="icon-frame-expand"></i>
                        <span>Scan Now</span>
                    </button>
                </div>
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
            console.log(data)
            if (data.includes('http://') || data.includes('https://')) {
                window.location.href = data
            } else {
                showToastMessage('Your QR code content is: ' + data)
            }
            this.onCloseModal()
        }
    }
    scanFail = err => {
        console.log(err)
        this.onCloseModal()
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
    hideNav: () => dispatch(closeDrawer('nav'))
});

const mapStateToProps = ({ user }) => {
    const { isSignedIn } = user
    return {
        isSignedIn
    };
}

export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(LeftMenuContent);
