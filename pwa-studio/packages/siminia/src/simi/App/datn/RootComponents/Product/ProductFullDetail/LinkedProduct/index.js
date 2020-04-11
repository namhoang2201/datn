import React from 'react'
import Identify from 'src/simi/Helper/Identify';
import { simiUseQuery } from 'src/simi/Network/Query';
import getProductsBySkus from 'src/simi/queries/catalog/getProductsBySkus.graphql';
import Loading from 'src/simi/BaseComponents/Loading';
import { GridItem } from 'src/simi/App/datn/BaseComponents/GridItem';
import { applySimiProductListItemExtraField } from 'src/simi/Helper/Product';
import CarouselBase from 'src/simi/App/datn/BaseComponents/Carousels';

require('./linkedProduct.scss');

const LinkedProducts = props => {
    const { product, history, showCarousel, isPhone } = props;
    const link_type = props.link_type ? props.link_type : 'related'
    const maxItem = 8 //max 10 items

    const handleLink = (link) => {
        history.push(link)
    }

    const mapGalleryItem = (item) => {
        const { small_image } = item;
        return {
            ...item,
            small_image:
                typeof small_image === 'object' ? small_image.url : small_image
        };
    }

    const renderProductItem = (item, index) => {
        return (
            <GridItem
                key={index}
                item={mapGalleryItem(item)}
                handleLink={handleLink.bind(this)}
                changeImage={true}
            />
        )
    }

    if (product.product_links && product.product_links.length) {
        const matchedSkus = []
        product.product_links.map((product_link) => {
            if (product_link.link_type === link_type)
                matchedSkus.push(product_link.linked_product_sku)
        })
        if (matchedSkus.length) {
            const { data } = simiUseQuery(getProductsBySkus, {
                variables: {
                    stringSku: matchedSkus,
                    currentPage: 1,
                    pageSize: maxItem,
                }
            });

            let linkedProducts = <Loading />;

            if (data && data.simiproducts && data.simiproducts.items) {
                linkedProducts = []
                data.products = applySimiProductListItemExtraField(data.simiproducts);
                if (!showCarousel) {
                    data.products.items.every((item, index) => {
                        let count = 0
                        if (count < maxItem) {
                            count++
                            linkedProducts.push(
                                <div key={index} className="linked-product-item">
                                    {renderProductItem(item, index)}
                                </div>
                            )
                            return true
                        }
                        return false
                    });
                } else {
                    const showItem = isPhone ? 2 : 4;
                    linkedProducts = <CarouselBase data={data.products.items} renderItems={renderProductItem} className="linked-product-carousel" showNumber={showItem} />;
                }
            }

            return (
                <div className="linked-product-ctn">
                    <h2 className="title">
                        <span>
                            {
                                link_type === 'related' ? Identify.__('Related Products') : link_type === 'crosssell' ? Identify.__('You may also be interested in') : ''
                            }
                        </span>
                    </h2>
                    <div className={`linked-products ${showCarousel ? 'linked-products-carousel' : ''}`}>
                        {linkedProducts}
                    </div>
                </div>
            )
        }
    }

    return ''
}
export default LinkedProducts
