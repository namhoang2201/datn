import React from 'react';
import Gallery from './Gallery';
import Identify from 'src/simi/Helper/Identify'
import Sortby from './Sortby'
import Filter from './Filter'
import LoadMore from './loadMore'
import Loading from 'src/simi/BaseComponents/Loading'
import Modal from 'react-responsive-modal'
import CompareProduct from '../CompareProducts/index'
import { analyticImpressionsGTM } from 'src/simi/Helper/Analytics';
import { getWishlist as simiGetWishlist } from 'src/simi/Model/Wishlist';
import { connect } from 'src/drivers';
import WishListItem from './WishList';
import { Link } from 'react-router-dom';
import { productUrlSuffix } from 'src/simi/Helper/Url';
require('./products.scss')

const $ = window.$;

class Products extends React.Component {
    constructor(props) {
        super(props)
        const isPhone = window.innerWidth < 1024
        this.state = ({
            isPhone: isPhone,
            openMobileModel: false,
            openCompareModal: false,
            wishlist: null,
            reRenderWishlist: false,
            totalWl: 0,
            compare: null
        })
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

    componentDidMount() {
        this.setIsPhone();
        this.setState({ compare: Identify.getDataFromStoreage(Identify.LOCAL_STOREAGE, 'compare_product') })
        if (this.state.isPhone) {
            $('.footer-app').addClass('has-bottom-filter');
        } else {
            if (this.props.isSignedIn) {
                this.getWishlist()
            }
        }
    }

    renderFilter() {
        const { props } = this
        const { data, filterData } = props;
        const { minPrice, maxPrice } = data.products;
        if (data && data.products &&
            data.products.filters) {
            return (
                <div>
                    <span className="shopping-option">{Identify.__('SHOPPING OPTION')}</span>
                    <Filter data={data.products.filters} filterData={filterData} minPrice={minPrice} maxPrice={maxPrice} />
                </div>
            );
        }
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

    renderLeftNavigation = () => {
        const shopby = [];
        const filter = this.renderFilter();
        const compare = this.renderCompare();
        const wishlist = this.renderWishList();
        if (filter) {
            shopby.push(
                <div
                    key="siminia-left-navigation-filter"
                    className="left-navigation" >
                    {filter}
                    <div className="compare-top-title sidebar">
                        <div className="title">compare product</div>
                    </div>
                    {compare}
                    {this.props.isSignedIn &&
                        <div className="wishlist-top-title sidebar">
                            <div className="title">my wish list</div>
                            {this.state.totalWl && (this.state.totalWl > 0) &&
                                <div className="count-item">({this.state.totalWl} items)</div>}
                        </div>
                    }
                    {this.props.isSignedIn && wishlist}
                </div>
            );
        }
        return shopby;
    }

    updateCompareList = () => {
        this.setState({ compare: Identify.getDataFromStoreage(Identify.LOCAL_STOREAGE, 'compare_product') })
    }

    removeItem = (itemId) => {
        let listItem = Identify.getDataFromStoreage(
            Identify.LOCAL_STOREAGE,
            'compare_product'
        );
        if (listItem) {
            const itemToRemove = listItem.findIndex(item => itemId === item.entity_id);

            if (itemToRemove !== -1) {
                listItem.splice(itemToRemove, 1)
                Identify.storeDataToStoreage(Identify.LOCAL_STOREAGE, 'compare_product', listItem)
                listItem = Identify.getDataFromStoreage(
                    Identify.LOCAL_STOREAGE,
                    'compare_product'
                );
                if (Array.isArray(listItem) && listItem.length === 0) {
                    localStorage.removeItem('compare_product');
                }
            }
        }
        this.updateCompareList()
    }

    renderCompare = () => {

        if (!this.state.compare) {
            return <div className="no-item">
                {Identify.__('You have no products to compare')}
            </div>
        } else {
            let cpitem = null
            cpitem = this.state.compare.map((item) => {
                const product_url = `/${item.url_key}${productUrlSuffix()}`
                const location = {
                    pathname: product_url
                }
                return (
                    <div className="compare-item">
                        <div className="remove-item"
                            role="presentation"
                            onClick={() => this.removeItem(item.entity_id)}
                        >
                            <i className="icon-cross2"></i>
                        </div>
                        <Link to={location} >
                            <div className="name-item">{Identify.__(item.name)}</div>
                        </Link>
                    </div>
                )
            })
            return (
                <div className="compare-group">
                    {cpitem}
                    <div className="compare-action">
                        <div className="compare" role="presentation" onClick={() => this.showModalCompare()}>
                            {Identify.__('Compare')}
                        </div>
                        <div className="view-all" role="presentation" onClick={() => this.showModalCompare()}>
                            {Identify.__('View all')}
                        </div>
                    </div>
                </div>
            )
        }
    }

    reRenderWL = () => {
        this.getWishlist()
    }

    renderWishList = () => {
        if (this.props.isSignedIn) {
            if (this.state.wishlist) {
                const dataWishlist = this.state.wishlist
                if (dataWishlist && dataWishlist.length === 0) {
                    return <div className="no-item">
                        {Identify.__('You have no items in your wish list')}
                    </div>
                }
                let html = null
                if (dataWishlist && dataWishlist.length) {
                    html = dataWishlist.map((item, index) => {
                        return <WishListItem
                            key={index}
                            item={item}
                            history={this.props.history}
                            reRenderWL={() => this.reRenderWL()}
                            stateWl={this.state.reRenderWishlist}
                        />
                    })
                }
                return html
            } else {
                return <Loading />
            }
        }
    }


    renderItemCount = (data) => {
        if (data && data.products && data.products.total_count) {
            const text = data.products.total_count > 1 ? Identify.__('%t products(s)') : Identify.__('%t product');
            return (
                <div className="items-count">
                    {text
                        .replace('%t', data.products.total_count)}
                </div>
            )
        }
    }

    updateSetPage = (newPage) => {
        const { pageSize, data, currentPage } = this.props
        if (newPage !== currentPage) {
            if (this.props.setCurrentPage && ((newPage - 1) * pageSize < data.products.total_count))
                this.props.setCurrentPage(newPage)
        }
    };


    renderBottomFilterSort() {
        const { props } = this
        const { data, filterData, sortByData } = props;
        const { minPrice, maxPrice } = data.products;
        return (
            <React.Fragment>
                <Modal open={this.state.openMobileModel !== false} onClose={this.closeModalFilter}
                    classNames={{ overlay: Identify.isRtl() ? "rtl-root" : "", modal: "products-mobile-sort-filter-modal" }}>
                    <div className="filter-title" style={{ display: this.state.openMobileModel === 'filter' ? 'block' : 'none' }}>{Identify.__('Filter')}</div>
                    <div className="filter-title" style={{ display: this.state.openMobileModel !== 'filter' ? 'block' : 'none' }}>{Identify.__('Sort')}</div>
                    <div className="modal-mobile-filter-view" style={{ display: this.state.openMobileModel === 'filter' ? 'block' : 'none' }}>
                        <Filter data={data.products.filters} filterData={filterData} filterData={filterData} minPrice={minPrice} maxPrice={maxPrice} />
                    </div>
                    <div className="modal-mobile-sort-view" style={{ display: this.state.openMobileModel !== 'filter' ? 'block' : 'none' }}>
                        <div className="top-sort-by">
                            <Sortby parent={this} data={data} sortByData={sortByData} sortFields={data.products.sort_fields || null} />
                        </div>
                    </div>
                </Modal>
                <div className="mobile-bottom-filter">
                    <div className="mobile-bottom-filter-subitem" role="presentation" onClick={this.showModalFilter}>
                        <span className="mobile-bottom-btn icon-funnel">
                        </span>
                        <div className="mobile-bottom-btn-title">
                            {Identify.__('Filter')}
                        </div>
                    </div>
                    <div className="mobile-bottom-filter-subitem" role="presentation" onClick={this.showModalSortby}>
                        <div className="mobile-bottom-btn-title">
                            {Identify.__('Sort')}
                        </div>
                        <span className="mobile-bottom-btn icon-sort-amount-asc" >
                        </span>
                    </div>
                </div>
            </React.Fragment>
        )
    }

    getWishlist = () => {
        simiGetWishlist(this.getWishlistCallback, { limit: 5 })
    }

    getWishlistCallback = (data) => {
        if (data) {
            this.setState({
                wishlist: data.wishlistitems,
                totalWl: data.total
            })
        }
    }
    componentWillUnmount() {
        $('.footer-app').removeClass('has-bottom-filter');
    }

    showModalSortby = () => {
        this.setState({
            openMobileModel: 'sortby'
        })
    }

    showModalFilter = () => {
        this.setState({
            openMobileModel: 'filter'
        })
    }
    closeModalFilter = () => {
        this.setState({
            openMobileModel: false
        })
    }
    reRenderWl = () => {
        this.getWishlist()
    }
    renderList = () => {
        const { props } = this
        const { data, pageSize, history, location, sortByData, currentPage, title, pageType } = props;
        const items = data ? data.products.items : null;
        if (!data)
            return <Loading />
        if (!data.products || !data.products.total_count) {
            $('.left-navigation').css('display', 'none')
            $('.listing-product').css('padding-left', 'unset')
            return (<div className="no-product">{Identify.__('No results found!')}</div>)
        }
        analyticImpressionsGTM(items, title, pageType || 'Category');
        return (
            <React.Fragment>
                {!this.state.isPhone ?
                    <div className="top-sort-by">
                        <Sortby
                            parent={this}
                            sortByData={sortByData}
                            sortFields={data.products.sort_fields || null}
                        />
                        {this.renderItemCount(data)}
                    </div> :
                    <div className="mobile-item-count">
                        {this.renderItemCount(data)}
                    </div>
                }
                <section className="gallery">
                    <CompareProduct history={history} openModal={this.state.openCompareModal} closeModal={this.closeCompareModal} />
                    <Gallery
                        openCompareModal={this.showModalCompare}
                        data={items}
                        pageSize={pageSize}
                        history={history}
                        location={location}
                        wishlist={this.state.wishlist}
                        reRenderWL={() => this.reRenderWL()}
                        updateCompare={() => this.updateCompareList()}
                    />
                </section>
                <div className="product-grid-pagination">
                    <LoadMore
                        updateSetPage={this.updateSetPage.bind(this)}
                        itemCount={data.products.total_count}
                        items={data.products.items}
                        limit={pageSize}
                        currentPage={currentPage}
                        loading={this.props.loading}
                    />
                </div>
            </React.Fragment>
        )
    }

    render() {
        const { props } = this
        const { data, title, cateEmpty, isSignedIn } = props;
        return (
            <article className="products-gallery-root">
                <React.Fragment>
                    <div className="product-list-container-siminia">
                        {!this.state.isPhone && this.renderLeftNavigation()}
                        {this.state.isPhone && this.renderBottomFilterSort()}
                        <div className="listing-product">
                            <div className={`result-title ${props.type === "category" ? 'cate' : ''}`}>{title}</div>
                            {this.renderList()}
                        </div>
                    </div>
                </React.Fragment>
            </article>
        );
    }
};

const mapStateToProps = ({ user }) => {
    const { isSignedIn } = user
    return {
        isSignedIn
    };
}

export default connect(mapStateToProps, null)(Products);
