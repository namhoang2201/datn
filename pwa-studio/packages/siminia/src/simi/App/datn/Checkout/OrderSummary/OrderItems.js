import React from 'react';
import Image from 'src/simi/BaseComponents/Image';
import { resourceUrl, logoUrl } from 'src/simi/Helper/Url';
import Identify from 'src/simi/Helper/Identify';
import { Price } from '@magento/peregrine';
import ReactHTMLParse from "react-html-parser";

const OrderItems = (props) => {
    const { items, cartCurrencyCode } = props;

    return items && items.length ? items.map(o_item => {
        let itemsOption = '';
        let optionElement = ''
        if (o_item.options.length > 0) {
            itemsOption = o_item.options.map((optionObject) => {
                return (
                    <div key={Identify.randomString()}>
                        <span className='option-title'>{ReactHTMLParse(optionObject.label)}: </span>
                        <span className='option-value'>{ReactHTMLParse(optionObject.value)}</span>
                    </div>
                );
            });

            optionElement = (
                <div className='item-options'>
                    {itemsOption}
                </div>
            );
        }
        const image = (o_item.image && o_item.image.file) ? o_item.image.file : o_item.simi_image

        return (
            <li key={Identify.randomString()} className='order-item'>
                <div className='item-image'>
                    <Image
                        src={
                            image ?
                                resourceUrl(image, {
                                    type: 'image-product',
                                    width: 80
                                }) :
                                logoUrl()
                        }
                        alt={o_item.name} />
                </div>
                <div className='item-info'>
                    <label className='item-name'>{ReactHTMLParse(o_item.name)}</label>
                    {optionElement}
                    <div className='item-qty-price'>
                        <span className='qty'>{Identify.__("Qty")}: {o_item.qty}</span>
                        <span className='price'><Price currencyCode={cartCurrencyCode} value={o_item.price} /></span>
                    </div>
                </div>
            </li>
        );
    }) : null;

}

export default OrderItems;
