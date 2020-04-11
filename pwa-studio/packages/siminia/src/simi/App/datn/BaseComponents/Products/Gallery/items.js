import React, { Component } from 'react';
import { arrayOf, number, shape } from 'prop-types';
import { GridItem } from 'src/simi/App/datn/BaseComponents/GridItem';
import Identify from 'src/simi/Helper/Identify'

const pageSize = 12;
const emptyData = Array.from({ length: pageSize }).fill(null);


class GalleryItems extends Component {
    constructor(props) {
        super(props)
    }
    static propTypes = {
        items: arrayOf(
            shape({
                id: number.isRequired
            })
        ).isRequired,
        pageSize: number
    };

    // map Magento 2.3.1 schema changes to Venia 2.0.0 proptype shape to maintain backwards compatibility
    mapGalleryItem(item) {
        const { small_image } = item;
        return {
            ...item,
            small_image:
                typeof small_image === 'object' ? small_image.url : small_image
        };
    }

    handleLink = (link) => {
        const { history } = this.props
        history.push(link)
    }

    render() {
        const { items } = this.props;
        if (items === emptyData) {
            return ''
        }
        return items.map(item => {
            if (this.props.wishlist && Array.isArray(this.props.wishlist) && this.props.wishlist.length) {
                const numberItemWishlist = this.props.wishlist.length
                for (let i = 0; i < numberItemWishlist; i++) {
                    if (item.id === parseInt(this.props.wishlist[i].product_id)) {
                        return (
                            <GridItem
                                key={Identify.randomString('5')}
                                item={this.mapGalleryItem(item)}
                                handleLink={this.handleLink.bind(this)}
                                inWishList={true}
                                reRenderWL={this.props.reRenderWL}
                                wlitems={this.props.wishlist}
                                updateCompare={this.props.updateCompare}
                            />
                        )
                    }
                }
            }
            return (
                <GridItem
                    key={Identify.randomString('5')}
                    item={this.mapGalleryItem(item)}
                    handleLink={this.handleLink.bind(this)}
                    inWishList={false}
                    reRenderWL={this.props.reRenderWL}
                    wlitems={this.props.wishlist}
                    updateCompare={this.props.updateCompare}
                />
            )
        });
    }
}

export { GalleryItems as default, emptyData };
