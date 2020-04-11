import React from 'react'
import Image from 'src/simi/BaseComponents/Image'
import { configColor } from 'src/simi/Config'
import { Price } from '@magento/peregrine'
import { resourceUrl, logoUrl, productUrlSuffix } from 'src/simi/Helper/Url';
import ReactHTMLParse from 'react-html-parser';

require('./cartItem.scss')

const reduceVal = (qty_id) => {
    const qtyField = $(`#${qty_id}`)
    const qty = parseInt(qtyField.val()) - 1
    if (qty) {
        qtyField.val(qty)
    }
}

const increaseVal = (qty_id) => {
    const qtyField = $(`#${qty_id}`)
    const qty = parseInt(qtyField.val()) + 1
    qtyField.val(qty)
}

const CartItem = props => {
    const { currencyCode, item, itemTotal, handleLink, miniOrMobile } = props

    const optionText = [];
    if (item.options) {
        const options = item.options;
        for (const i in options) {
            const option = options[i];
            optionText.push(
                <div key={i}>
                    <span>{option.label}</span> : {ReactHTMLParse(option.value)}
                </div>
            );
        }
    }

    const itemOption = Array.isArray(optionText) && optionText.length ?
        <div className='item-options'>{optionText.reverse()}</div>
        : ''

    const tax_cart_display_price = 3; // 1 - exclude, 2 - include, 3 - both
    const rowTotal = tax_cart_display_price == 1 ? itemTotal.row_total : itemTotal.row_total_incl_tax
    const subtotal = itemTotal && rowTotal && <Price
        currencyCode={currencyCode}
        value={rowTotal}
    />

    const itemSubTotal = (
        <div className='item-subtotal'>
            {subtotal}
        </div>
    )

    const location = `/product.html?sku=${item.simi_sku ? item.simi_sku : item.sku}`
    const image = (item.image && item.image.file) ? item.image.file : item.simi_image
    const cartItemImage = (
        <div
            role="presentation"
            onClick={() => {
                handleLink(location)
            }}
            className='img-cart-container'
        >
            <Image
                src={
                    image ?
                        resourceUrl(image, {
                            type: 'image-product',
                            width: 300
                        }) :
                        logoUrl()
                }
                alt={item.name} />
        </div>
    )
    const cartItemName = (
        <div
            className="item-name"
            role="presentation"
            style={{ color: configColor.content_color }}
            onClick={() => {
                handleLink(`/${item.url_key}${productUrlSuffix()}`)
            }}>
            {item.name}
        </div>
    )
    if (miniOrMobile)
        return (
            <div className={`fashiontheme-siminia-cart-item miniOrMobile`}>
                {cartItemImage}
                <div className="cart-item-detail">
                    {cartItemName}
                    {itemSubTotal}
                    {itemOption}
                    <div className="item-qty">
                        <input
                            min={1}
                            type="number"
                            pattern="[1-9]*"
                            defaultValue={item.qty}
                            onBlur={(event) => {
                                if (parseInt(event.target.value, 10) !== parseInt(item.qty, 10)) {
                                    props.updateCartItem(item, parseInt(event.target.value, 10))
                                }
                            }
                            }
                        />
                    </div>
                    <div className="item-action">
                        <div
                            role="button"
                            tabIndex="0"
                            className='item-delete'
                            onClick={() => props.removeFromCart(item)}
                            onKeyUp={() => props.removeFromCart(item)}
                        >
                            <i className="icon-trash" />
                        </div>
                    </div>
                </div>
            </div>
        )

    const quantityInputId = `cart_item_qty_input_${item.item_id}`
    return (
        <tr className="fashiontheme-siminia-cart-item" >
            <td className="td-item-info">
                <div className="cart-item-info">
                    {cartItemImage}
                    < div className="name-and-option" >
                        {cartItemName}
                        {itemOption}
                    </div >
                    <div className="item-action">
                        <div
                            role="button"
                            tabIndex="0"
                            className='item-delete'
                            onClick={() => props.removeFromCart(item)}
                            onKeyUp={() => props.removeFromCart(item)}
                        >
                            <i className="icon-trash" />
                        </div>
                    </div>
                </div >
            </td >
            <td className="td-item-price">
                <Price currencyCode={currencyCode} value={item.price} />
            </td>
            <td className="td-item-qty">
                <div className="item-qty">
                    <div className="minus-quantity" role="presentation" onClick={() => reduceVal(quantityInputId)}>-</div>
                        <input defaultValue={item.qty} type="number" id={quantityInputId} />
                    <div className="increase-quantity" role="presentation" onClick={() => increaseVal(quantityInputId)}>+</div>
                </div>
            </td>
            <td className="td-item-subtotal">
                {itemSubTotal}
            </td>
        </tr >
    )
}
export default CartItem;