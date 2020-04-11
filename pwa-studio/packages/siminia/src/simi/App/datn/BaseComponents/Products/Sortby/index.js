import React from 'react';
import Identify from 'src/simi/Helper/Identify';
import Check from 'src/simi/BaseComponents/Icon/TapitaIcons/SingleSelect';
import { configColor } from "src/simi/Config";
import Dropdownoption from 'src/simi/BaseComponents/Dropdownoption/'
import { showFogLoading } from 'src/simi/BaseComponents/Loading/GlobalLoading';
import { withRouter } from 'react-router-dom';


const Sortby = props => {
    const { history, location, sortByData, sortFields } = props;
    const { search } = location;
    let dropdownItem = null
    const width = window.innerWidth;
    const isPhone = width < 1024;

    const changedSortBy = (item) => {
        showFogLoading()
        if (dropdownItem)
            dropdownItem.handleToggle()
        const queryParams = new URLSearchParams(search);
        queryParams.set('product_list_order', item.value);
        queryParams.set('product_list_dir', item.direction);
        history.push({ search: queryParams.toString() });
    }

    parent = props.parent
    let selections = []

    let orders = [
        { "value": "name", "label": "name", "direction": "asc" },
        { "value": "name", "label": "Name", "direction": "desc" },
        { "value": "price", "label": "Price", "direction": "asc" },
        { "value": "price", "label": "Price", "direction": "desc" },
    ];
    if (sortFields && sortFields.options) {
        orders = [];
        sortFields.options.map((item) => {
            if (item.value === 'position') {
                // do nothing
            } else
                if (item.value === 'name') {
                    orders.push({ ...item, direction: "asc" })
                } else {
                    orders.push({ ...item, direction: "asc" })
                    orders.push({ ...item, direction: "desc" })
                }
            return item;
        });
    }

    let sortByTitle = Identify.__('Sort by ');

    selections = orders.map((item) => {
        let itemCheck = ''
        const itemTitle = (
            <React.Fragment>
                {Identify.__(item.label)} {item.direction === 'asc' ? (item.value === 'name' || item.value === 'position') ? '' : 'low to hight' : 'hight to low'}
            </React.Fragment>
        )

        if (sortByData && sortByData[`${item.value}`] === item.direction.toUpperCase()) {
            itemCheck = (
                <span className="is-selected">
                    <Check color={configColor.button_background} style={{ width: 16, height: 16, marginRight: 4 }} />
                </span>
            )
            sortByTitle = itemTitle
        }
        return (
            <div
                role="presentation"
                key={Identify.randomString(5)}
                className="dir-item"
                onClick={() => changedSortBy(item)}
            >
                <div className="dir-title">
                    {itemTitle}
                </div>
                <div className="dir-check">
                    {itemCheck}
                </div>
            </div>
        );
    });

    return (
        <React.Fragment>
            {
                selections.length === 0 ?
                    <span></span> :
                    <div className="sort-by-select">
                        {isPhone ? selections : (
                            <Dropdownoption
                                title={sortByTitle}
                                ref={(item) => { dropdownItem = item }}
                            >
                                {selections}
                            </Dropdownoption>
                        )
                        }
                    </div>
            }
        </React.Fragment>
    )
}

export default (withRouter)(Sortby);