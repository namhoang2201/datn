import React, { Suspense } from 'react'
import Identify from "src/simi/Helper/Identify";
import WishList from 'src/simi/BaseComponents/Icon/WishList'
import MenuIcon from 'src/simi/BaseComponents/Icon/Menu'
import ToastMessage from 'src/simi/BaseComponents/Message/ToastMessage'
import ToastSuccess from 'src/simi/BaseComponents/Message/ToastSuccess';
import TopMessage from 'src/simi/BaseComponents/Message/TopMessage'
import NavTrigger from './Component/navTrigger'
import CartTrigger from './cartTrigger'
import defaultClasses from './header.css'
import { mergeClasses } from 'src/classify'
import { Link } from 'src/drivers';
import HeaderNavigation from './Component/HeaderNavigation'
import MyAccount from './Component/MyAccount'
import Settings from './Component/Settings'
import { withRouter } from 'react-router-dom';
import { logoUrl } from 'src/simi/Helper/Url'
import CompareProduct from 'src/simi/App/datn/BaseComponents/CompareProducts'
require('./header.scss');

const SearchForm = React.lazy(() => import('./Component/SearchForm'));

class Header extends React.Component {
    constructor(props) {
        super(props);
        this._mounted = true;
        const isPhone = window.innerWidth < 1024;
        this.state = {
            isPhone,
            openCompareModal: false
        }
        this.classes = mergeClasses(defaultClasses, this.props.classes)
    }

    setMinPhone = () => {
        const width = window.innerWidth;
        const isPhone = width < 1024;
        if (this.state.isPhone !== isPhone) {
            this.setState({ isPhone })
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.setMinPhone);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.setMinPhone);
    }

    showModalCompare = () => {
        this.setState({
            openCompareModal: true
        })
    }

    closeCompareModal = () => {
        this.setState({
            openCompareModal: false
        })
    }


    renderLogo = () => {
        const { isPhone } = this.state;
        return (
            <div className={`${this.classes['search-icon']} ${this.classes['header-logo']}`} >
                <Link to='/'>
                    <div
                        className={`${this.classes['icon']}`}
                        style={!isPhone ? { width: 240, height: 40 } : { width: 180, height: 30 }}
                    > 
                    </div>
                </Link>
            </div>
        )
    }

    renderSearchForm = () => {
        return (
            <div className={`${this.classes['header-search']} header-search ${Identify.isRtl() ? this.classes['header-search-rtl'] : ''}`}>
                <Suspense fallback={null}>
                    <SearchForm
                        history={this.props.history}
                    />
                </Suspense>
            </div>
        )
    }

    renderRightBar = () => {
        const { classes } = this
        const compareData = Identify.getDataFromStoreage(Identify.LOCAL_STOREAGE, 'compare_product')
        const compareStyle = compareData && compareData.length > 0 ? 'compare-list' : 'non-compare'
        return (
            <div className={`${classes['right-bar']} ${Identify.isRtl() ? 'right-bar-rtl' : ''}`}>
                <div className={classes['right-bar-item']} id="my-account">
                    <MyAccount classes={classes} />
                </div>
                <div
                    className={classes['right-bar-item']} id="wish-list"
                >
                    <div className={classes['item-icon']} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {/* <WishList style={{width: 30, height: 30, display: 'block'}} /> */}
                        <span
                            role="presentation"
                            className="add-to-compare-btn icon-sync2"
                            onClick={this.showModalCompare}
                            style={{ width: 30, height: 30, display: 'block', fontSize: '25px' }}
                        >
                        </span>
                        <CompareProduct history={history} openModal={this.state.openCompareModal} closeModal={this.closeCompareModal} />
                    </div>
                    <div className={classes['item-text']}>
                        {Identify.__('Compare')}
                    </div>
                </div>
                <div className={`${classes['right-bar-item']} ${Identify.isRtl() ? 'right-bar-item-rtl' : ''}`}>
                    <CartTrigger classes={classes} />
                </div>
            </div>
        )
    }

    renderViewPhone = () => {
        return (
            <div>
                <div className="container">
                    <div className={this.classes['header-app-bar']}>
                        <NavTrigger>
                            <MenuIcon color="#333132" style={{ width: 30, height: 30 }} />
                        </NavTrigger>
                        {this.renderLogo()}
                        <div className={this.classes['right-bar']}>
                            <div className={this.classes['right-bar-item']}>
                                <CartTrigger />
                            </div>
                        </div>
                    </div>
                </div>
                {this.renderSearchForm()}
                <div id="id-message">
                    <TopMessage />
                    <ToastMessage />
                    <ToastSuccess />
                </div>
            </div>


        )
    }

    render() {
        this.classes = mergeClasses(defaultClasses, this.props.classes);
        if (this.state.isPhone) {
            return this.renderViewPhone()
        }
        return (
            <React.Fragment>
                <div className="container">
                    <div className={this.classes['header-app-bar']}>
                        {this.renderSearchForm()}
                        {this.renderLogo()}
                        {this.renderRightBar()}
                    </div>
                </div>
                {window.innerWidth >= 1024 && <HeaderNavigation classes={this.classes} />}
                <div id="id-message">
                    <TopMessage />
                    <ToastMessage />
                    <ToastSuccess />
                </div>
            </React.Fragment>
        )
    }
}
export default (withRouter)(Header)
