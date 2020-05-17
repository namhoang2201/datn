/* eslint-disable prefer-const */
import React, { useState, useEffect } from "react";
import Identify from "src/simi/Helper/Identify";
import { formatPrice } from "src/simi/Helper/Pricing";
import Loading from "src/simi/BaseComponents/Loading";
import ReactHTMLParse from "react-html-parser";
import { Link } from "react-router-dom";
import "./../../style.scss";
import { getOrderDetail } from 'src/simi/Model/Orders';
import { showFogLoading, hideFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading'
import { toggleMessages } from 'src/simi/Redux/actions/simiactions';
import { connect } from 'src/drivers';

const Detail = (props) => {
    const [data, setData] = useState(null)
    const [loaded, setLoaded] = useState(false)
    const { history, isPhone } = props
    const id = history.location.state.orderData.increment_id || null;

    // small phone
    const [isSmallPhone, setIsSmallPhone] = useState(window.innerWidth < 601)

    const resizePhone = () => {
        window.onresize = function () {
            const width = window.innerWidth;
            // small phone
            const newIsPhone = width < 601
            if (isSmallPhone !== newIsPhone) {
                setIsSmallPhone(newIsPhone)
            }
        }
    }

    useEffect(() => {
        resizePhone();
    }, [isSmallPhone])

    useEffect(() => {
        const api = Identify.ApiDataStorage('quoteOrder') || {}
        if (api.hasOwnProperty(id)) {
            const data = api[id]
            setData(data)
            setLoaded(true)
        }
        if (!data && !loaded && id) {
            getOrderDetail(id, processData)
        }
    }, [])


    const processData = (data) => {
        let dataArr = {}
        const key = id;
        let dataOrder = data.order;
        setData(dataOrder)
        dataArr[key] = dataOrder;
        Identify.ApiDataStorage("quoteOrder", 'update', dataArr);
    }

    const getDateFormat = dateData => {
        const date = new Date(dateData);
        const day = date.getDate();
        let month =
            date.getMonth() + 1 < 10
                ? '0' + (date.getMonth() + 1)
                : date.getMonth() + 1;
        const year = date.getFullYear();
        switch (month) {
            case '01':
                month = 'January';
                break;
            case '02':
                month = 'February';
                break;
            case '03':
                month = 'March';
                break;
            case '04':
                month = 'April';
                break;
            case '05':
                month = 'May';
                break;
            case '06':
                month = 'June';
                break;
            case '07':
                month = 'July';
                break;
            case '08':
                month = 'August';
                break;
            case '09':
                month = 'September';
                break;
            case '10':
                month = 'October';
                break;
            case '11':
                month = 'November';
                break;
            case '12':
                month = 'December';
                break;
        }

        return month + ' ' + day + ', ' + year;
    };

    const getFormatPrice = value => {
        return formatPrice(Number(value))
    }

    const onBackOrder = () => {
        history.push({ pathname: '/orderhistory.html' });
    }

    const renderItem = items => {
        let html = null;
        const totalPrice = data.total;

        if (items.length > 0) {
            html = items.map((item, index) => {
                let optionText = [];
                if (item.option) {
                    let options = item.option;
                    for (let i in options) {
                        let option = options[i];
                        optionText.push(
                            <div key={Identify.makeid()}>
                                <b>{option.option_title}</b> :{' '}
                                {ReactHTMLParse(option.option_value)}
                            </div>
                        );
                    }
                }

                const location = `/product.html?sku=${
                    item.simi_sku ? item.simi_sku : item.sku
                    }`;

                return (
                    <React.Fragment key={Identify.randomString(5)}>
                        <tr key={Identify.randomString(5)} className={(index + 1) == items.length ? 'last-tr' : ''}>
                            <td className="colName" data-title="Product name">
                                <Link to={location} className="img-name-col">
                                    {ReactHTMLParse(item.name)}
                                    {optionText.length > 0 && (
                                        <div className="item-options">
                                            {optionText}
                                        </div>
                                    )}
                                </Link>
                            </td>
                            <td data-title="SKU">{item.sku}</td>
                            <td style={{ textAlign: 'right' }} data-title="Price">
                                {totalPrice.tax
                                    ? getFormatPrice(item.price_incl_tax, data.order_currency_code)
                                    : getFormatPrice(item.price, data.order_currency_code)}
                            </td>
                            <td style={{ textAlign: 'right', minWidth: '10%' }} data-title="Qty">
                                <span className="qty" >
                                    {parseInt(item.qty_ordered, 10)}
                                </span>
                            </td>
                            <td style={{ textAlign: 'right' }} data-title="Subtotal">
                                {totalPrice.tax
                                    ? getFormatPrice(item.row_total_incl_tax, data.order_currency_code)
                                    : getFormatPrice(item.row_total, data.order_currency_code)}
                            </td>
                        </tr>
                    </React.Fragment>
                );
            });
        }
        return html;
    };

    const renderTableItems = () => {
        let html = null;
        if (data) {
            const totalPrice = data.total;
            html = (
                <div className="order-detail-table">
                    {
                        <table className={isSmallPhone ? "col-xs-12 table-striped table-siminia" : ""}>
                            <thead>
                                <tr>
                                    <th className="colName">Product Name</th>
                                    <th>SKU</th>
                                    <th style={{ textAlign: 'right' }}>
                                        Price
                                    </th>
                                    <th style={{ textAlign: 'center' }}>Qty</th>
                                    <th style={{ textAlign: 'right' }}>
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.order_items.length > 0
                                    ? renderItem(data.order_items)
                                    : Identify.__('No product found!')}
                                <tr className="special-row" data-title="Subtotal">
                                    <td colSpan="5">
                                        {Identify.__('Subtotal: ')}
                                        {totalPrice.tax
                                            ? getFormatPrice(
                                                totalPrice.subtotal_incl_tax, data.order_currency_code
                                            )
                                            : getFormatPrice(
                                                totalPrice.subtotal_excl_tax, data.order_currency_code
                                            )}
                                    </td>
                                </tr>
                                {data.namrewardpoints_discount&&<tr className="special-row" data-title="NamRP Discount: ">
                                    <td colSpan="5">
                                        {Identify.__('NamRP Discount: ')}
                                        {getFormatPrice(data.namrewardpoints_discount)}
                                    </td>
                                </tr>}
                                {data.point_earn&&<tr className="special-row" data-title="Point Earned: ">
                                    <td colSpan="5">
                                        {Identify.__('Point Earned: ')}
                                        {data.point_earn}
                                    </td>
                                </tr>}
                                {data.point_spend&&<tr className="special-row" data-title="Point Spent: ">
                                    <td colSpan="5">
                                        {Identify.__('Point Spent: ')}
                                        {data.point_spend}
                                    </td>
                                </tr>}
                                <tr className="special-row grand-total">
                                    <td className="super-special" colSpan="5">
                                        {Identify.__('Grand Total: ')}
                                        {totalPrice.tax
                                            ? getFormatPrice(
                                                totalPrice.grand_total_incl_tax, data.order_currency_code
                                            )
                                            : getFormatPrice(
                                                totalPrice.shipping_hand_excl_tax, data.order_currency_code
                                            )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    }
                </div>
            );
        }
        return html;
    };

    const renderFooter = () => {
        const totalPrice = data.total;

        return (
            <div className="detail-order-footer">
                <div className="box-total-price">
                    {totalPrice && <div className="total-sub-price-container">
                        <div className="summary-price-line">
                            <span className="bold">{Identify.__('Subtotal')}</span>
                            <span className="price">{totalPrice.tax ? getFormatPrice(totalPrice.subtotal_incl_tax) : getFormatPrice(totalPrice.subtotal_excl_tax)}</span>
                        </div>
                        <div className="summary-price-line total">
                            <span className="bold">{Identify.__('Total')}</span>
                            <span className="price">{totalPrice.tax ? getFormatPrice(totalPrice.grand_total_incl_tax) : getFormatPrice(totalPrice.shipping_hand_excl_tax)}</span>
                        </div>
                    </div>}
                </div>
            </div>
        )
    }

    if (!data) {
        return <Loading />;
    }
    return (
        <div className="dashboard-acc-order-detail">
            <div className="order-detail-page-title">
                {Identify.__("Order ") + "#" + data.increment_id}
            </div>
            <div className="order-date">
                {!isPhone && getDateFormat(data.created_at)}
            </div>
            {renderTableItems()}
            {/* {renderFooter()} */}
            <div className="order-information-title">
                {Identify.__('Order Information')}
            </div>
            <div className="order-information-detail">
                <div className="container order-detail-container">
                    <div className="row detail-row">
                        <div className="col-md-3 col-sm-6 detail-col">
                            <div className="title">
                                {Identify.__('Shipping Address')}
                            </div>
                            <div className="detail">
                                <address>
                                    {Identify.__(data.shipping_address.firstname)}{' '}
                                    {Identify.__(data.shipping_address.lastname)}
                                    <br />
                                    {Identify.__(data.shipping_address.email)} <br />
                                    {Identify.__(data.shipping_address.company)} <br />
                                    {Identify.__(data.shipping_address.street)} <br />
                                    {Identify.__(data.shipping_address.city)},{' '}
                                    {Identify.__(data.shipping_address.region)},{' '}
                                    {Identify.__(data.shipping_address.postcode)} <br />
                                    +{Identify.__(data.shipping_address.telephone)}
                                </address>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 detail-col">
                            <div className="title">
                                {Identify.__('Shipping Method')}
                            </div>
                            <div className="detail">
                                {Identify.__(data.shipping_method)}
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 detail-col">
                            <div className="title">
                                {Identify.__('Billing Address')}
                            </div>
                            <div className="detail">
                                <address>
                                    {Identify.__(data.billing_address.firstname)}{' '}
                                    {Identify.__(data.billing_address.lastname)}
                                    <br />
                                    {Identify.__(data.billing_address.email)} <br />
                                    {Identify.__(data.billing_address.company)} <br />
                                    {Identify.__(data.billing_address.street)} <br />
                                    {Identify.__(data.billing_address.city)},{' '}
                                    {Identify.__(data.billing_address.region)},{' '}
                                    {Identify.__(data.billing_address.postcode)} <br />
                                    +{Identify.__(data.billing_address.telephone)}
                                </address>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 detail-col">
                            <div className="title">
                                {Identify.__('Payment Method')}
                            </div>
                            <div className="detail">
                                {Identify.__(data.payment_method)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const mapDispatchToProps = {
    toggleMessages,
}

export default connect(
    null,
    mapDispatchToProps
)(Detail);
