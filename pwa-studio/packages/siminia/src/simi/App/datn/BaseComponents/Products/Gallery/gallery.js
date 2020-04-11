import React, { Component } from 'react';
import { string, shape, array, number } from 'prop-types';

import GalleryItems, { emptyData } from './items';
import Loading from 'src/simi/BaseComponents/Loading'
require('./gallery.scss')

class Gallery extends Component {
    constructor(props) {
        super(props)
    }
    static propTypes = {
        classes: shape({
            filters: string,
            items: string,
            pagination: string,
            root: string
        }),
        data: array,
        pageSize: number
    };

    static defaultProps = {
        data: emptyData
    };

    render() {
        const { classes, data, pageSize, history, openCompareModal } = this.props;
        const hasData = Array.isArray(data) && data.length;
        const items = hasData ? data : emptyData;

        return (
            <div className="gallery-root">
                {!hasData && <Loading />}
                <div className="gallery-items">
                    <GalleryItems
                        items={items} pageSize={pageSize}
                        history={history}
                        reRenderWL={this.props.reRenderWL}
                        wishlist={this.props.wishlist}
                        updateCompare={this.props.updateCompare}
                    />
                </div>
            </div>
        );
    }
}

export default Gallery;
