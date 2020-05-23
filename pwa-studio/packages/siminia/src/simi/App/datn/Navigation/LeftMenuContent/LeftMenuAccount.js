import React from 'react'
import Identify from 'src/simi/Helper/Identify';
import MenuItem from './MenuItem';
import ListItemNested from "src/simi/BaseComponents/MuiListItem/Nested";
import { smoothScrollToView } from 'src/simi/Helper/Behavior';

const listAccountMenu = [
    {
        title: Identify.__('My Account'),
        url: '/account.html',
        page: 'dashboard',
        enable: true,
        sort_order: 10
    },
    {
        title: Identify.__('My Orders'),
        url: '/orderhistory.html',
        page: 'my-order',
        enable: true,
        sort_order: 20
    },
    {
        title: Identify.__('RewardPoint Transactions'),
        url: '/transaction.html',
        page: 'transaction',
        enable: true,
        sort_order: 25
    },
    {
        title: Identify.__('Account Information'),
        url: '/profile.html',
        page: 'edit-account',
        enable: true,
        sort_order: 30
    },
    {
        title: Identify.__('Newsletter'),
        url: '/newsletter.html',
        page: 'newsletter',
        enable: true,
        sort_order: 40
    },
    {
        title: Identify.__('Address Book'),
        url: '/addresses.html',
        page: 'address-book',
        enable: true,
        sort_order: 50
    },
    {
        title: Identify.__('Wishlist'),
        url: '/wishlist.html',
        page: 'wishlist',
        enable: true,
        sort_order: 60
    },
    {
        title: Identify.__('Logout'),
        url: '/logout.html',
        page: 'logout',
        enable: true,
        sort_order: 110
    }
]

class LeftMenuAccount extends React.Component {
    constructor(props) {
        super(props)
    }

    scrollTop = () => {
        smoothScrollToView($('#root'));
    }

    listPages = pages => {
        let result = null;
        if (pages.length > 0) {
            result = pages.map((page, index) => {
                return (
                    <li key={index}
                        role="presentation"
                        onClick={() => this.openLocation(page)}
                        className="list-item-account-title"
                    >
                        <MenuItem
                            title={Identify.__(page.title)}
                        />
                    </li>
                );
            })
        }

        return <ul>{result}</ul>;
    }

    openLocation = (location) => {
        this.props.handleMenuItem(location);
        this.scrollTop()
    }

    renderItem(listAccountMenu) {
        if (listAccountMenu.length > 1) {
            return (
                <div className="left-account-menu">
                    <ListItemNested
                        primarytext={<div className="left-menu-account-title" >my account</div>}
                        myaccount={true}
                    >
                        {this.renderSubItem(listAccountMenu)}
                    </ListItemNested>
                </div>
            )
        }

        return false;
    }

    renderSubItem(listAccountMenu) {
        let menuAccountRender = [];

        menuAccountRender = listAccountMenu.map((item, index) => {
            const accountItem = (
                <div className={'list-account-menu-item'} style={{ display: 'flex' }}>
                    <div className={`account-item-name`}>
                        {item.title}
                    </div>
                </div>
            )
            return (
                <div
                    role="presentation"
                    key={index}
                    style={{ marginLeft: 5, marginRight: 5 }}
                    onClick={() => this.openLocation(item)}>
                    <MenuItem title={accountItem}
                        className="left-account-item"
                    />
                </div>
            );
        }, this);

        return menuAccountRender;
    }

    render() {
        try {
            const item = this.renderItem(listAccountMenu)
            return item
        } catch (err) {
            console.log(err)
        }
        return ''
    }
}

export default LeftMenuAccount