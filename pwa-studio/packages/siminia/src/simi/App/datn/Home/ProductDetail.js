import React from 'react'
import Identify from "src/simi/Helper/Identify";
import { simiUseQuery } from 'src/simi/Network/Query' 
import getCategory from 'src/simi/queries/catalog/getCategory.graphql'
import Loading from "src/simi/BaseComponents/Loading";
import Gallery from 'src/simi/App/datn/BaseComponents/Products/Gallery';
import { GridItem } from "src/simi/App/datn/BaseComponents/GridItem";
import {applySimiProductListItemExtraField} from 'src/simi/Helper/Product'

const ProductItem = props => {
    const { dataProduct, history} = props;
    const {data} = simiUseQuery(getCategory, {variables: {
        id: Number(dataProduct.category_id),
        pageSize: Number(8),
        currentPage: Number(1),
        stringId: String(dataProduct.category_id)
    }});
    console.log(data)
    const handleAction = (location) => {
        history.push(location);
    }

    if(!data) return <Loading />

    const renderProductItem = (item,lastInRow) => {
        const itemData =  {
            ...item,
            small_image:
                typeof item.small_image === 'object' && item.small_image.hasOwnProperty('url') ? item.small_image.url : item.small_image
        }
        return (
            <div
                key={`horizontal-item-${item.id}`}
                className={`horizontal-item ${lastInRow? 'last':'middle'}`}
                style={{
                    display: 'inline-block', 
                }}
                >
                <GridItem
                    item={itemData}
                    handleLink={handleAction}
                />
            </div>
        );
    }

    const renderProductGrid = (items) => {
        const products = items.map((item, index) => {
            return renderProductItem(item, (index % 4 === 3))
        });
        
        return (
            <div className="horizontal-flex" style={{
                width: '100%',
                flexWrap: 'wrap',
                display: 'flex',
                direction: Identify.isRtl()?'rtl':'ltr'
            }}>
                {products}
            </div>
        )
    }

    if(data.simiproducts.hasOwnProperty('items') && data.simiproducts.total_count > 0) {
        data.products = applySimiProductListItemExtraField(data.simiproducts)
        // const productItem = applySimiProductListItemExtraField(data.simiproducts);
        return (
            <div className="product-list">
                <div className="product-horizotal">
                    {/* {renderProductGrid(productItem.items)} */}
                    <Gallery
                        data={data.products.items}
                        pageSize={9}
                        history={history}
                        location={props.location}
                    />
                </div>
            </div>
        )
 
    }

    return 'Product was found';
}

export default ProductItem;