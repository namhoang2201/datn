import React, {useMemo} from 'react';
import Panel from 'src/simi/BaseComponents/Panel';
import Identify from 'src/simi/Helper/Identify';
import Total from 'src/simi/BaseComponents/Total';
import isObjectEmpty from 'src/util/isObjectEmpty';
import OrderItems from './OrderItems';

require('./OrderSummary.scss')
const $ = window.$;

const OrderSummary = (props) => {

    const { cart, cartCurrencyCode, panelClassName, btnPlaceOrder } = props;
    const { details } = cart;
    const isGuest = details && details.hasOwnProperty('customer_is_guest') && details.customer_is_guest;
    const totalLabel = details && details.hasOwnProperty('items_count') && details.items_count + Identify.__(' items in cart');

    const orderItem = useMemo(() => details && details.items && <OrderItems items={details.items} cartCurrencyCode={cartCurrencyCode} />, [details.items]);

    const handleToggleItems = (e) => {
        const parent = $(e.currentTarget);
        parent.next('ul').slideToggle('fast');
        parent.find('.icon-chevron-down').toggleClass('rotate-180')
    }

    const totalsSummary = (
        <Total data={cart.totals} currencyCode={cartCurrencyCode} isSignedIn={!isGuest}/>
    )

    const summaryItem = (
        <div className='order-review-container'>
            <div className='order-review item-box'>
                <div className='order-items-header' id="order-items-header" onClick={(e) => handleToggleItems(e)} role="presentation">
                    <div className='item-count'>
                        <span>{totalLabel} </span>
                        <i className="icon-chevron-down"></i>
                    </div>
                </div>
                <ul className='items'>
                    {orderItem}
                </ul>
            </div>
        </div>
    )

    const renderView = (
        <div className='order-summary-content'>
            {summaryItem}
            {cart.totals && !isObjectEmpty(cart.totals) && totalsSummary}
            {btnPlaceOrder}
        </div>
    )

    return <div className='order-summary' id="order-summary">
        <Panel title={<div className='checkout-section-title'>{Identify.__('Summary')}</div>}
            className={panelClassName}
            renderContent={renderView}
            isToggle={false}
            expanded={true}
        />
    </div>
}

export default OrderSummary;
