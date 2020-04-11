import React from 'react';
import Abstract from './Abstract';
import Identify from 'src/simi/Helper/Identify'

class Simple extends Abstract {
    renderView = () => {
        const { classes } = this.props
        ////simple, configurable ....
        let price_label = null;
        let special_price_label = null;
        let price_excluding_tax = null;
        let price_including_tax = null;
        let price = null;
        if (this.prices.has_special_price) {
            if (this.prices.show_ex_in_price !== null && this.prices.show_ex_in_price === 1) {
                special_price_label = (<div className="special-price-label">{this.prices.special_price_label}</div>);
                price_excluding_tax = (
                    <div className="excl-price">
                        <span className="excl-price-label">{Identify.__('Excl. Tax')}: </span>
                        <span className="excl-price-value">{this.formatPrice(this.prices.minimalPrice.excl_tax_amount.value, this.prices.minimalPrice.amount.currency)}</span>
                    </div>
                );
                price_including_tax = (
                    <div className="incl-price">
                        <span className="incl-price-label">{Identify.__('Incl. Tax')}: </span>
                        <span className="incl-price-value">{this.formatPrice(this.prices.minimalPrice.amount.value, this.prices.minimalPrice.amount.currency)}</span>
                    </div>
                );
            } else {
                price = (<div className="price-value" >{this.formatPrice(this.prices.minimalPrice.amount.value, this.prices.minimalPrice.amount.currency)}</div>);
            }

            price_label = (
                <div className="regular-price">
                    {/* <span className="regular-price-label">{Identify.__('Regular Price')}: </span> */}
                    <strike><span className="regular-price-value">{this.formatPrice(this.prices.regularPrice.amount.value, false)} </span></strike>
                    {/* <span className={`${classes["sale_off"]} sale_off`}>-{this.prices.discount_percent}%</span> */}
                </div>
            );
        } else {
            if (this.prices.show_ex_in_price !== null && this.prices.show_ex_in_price === 1) {
                price_excluding_tax = (
                    <div className="excl-price">
                        <span className="excl-price-label">{Identify.__('Excl. Tax')}: </span>
                        <span className="excl-price-value">{this.formatPrice(this.prices.minimalPrice.excl_tax_amount.value, this.prices.minimalPrice.amount.currency)}</span>
                    </div>
                );
                price_including_tax = (
                    <div className="incl-price">
                        <span className="incl-price-label">{Identify.__('Incl. Tax')}: </span>
                        <span className="incl-price-value">{this.formatPrice(this.prices.minimalPrice.amount.value, this.prices.minimalPrice.amount.currency)}</span>
                    </div>
                );
            } else {
                price = (<div className="price-value">{this.formatPrice(this.prices.minimalPrice.amount.value, this.prices.minimalPrice.amount.currency)}</div>);
            }
        }
        return (
            <div className={`${classes['product-prices']} product-prices`} >
                {price}
                {price_label}
                {special_price_label}
                {price_excluding_tax}
                {price_including_tax}
            </div>
        );
    };

    render() {
        return super.render();
    }
}
export default Simple;
