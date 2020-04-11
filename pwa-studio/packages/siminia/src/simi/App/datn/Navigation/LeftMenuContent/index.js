import React from 'react'
import Identify from "src/simi/Helper/Identify"
import CateTree from 'src/simi/App/core/Navigation/Dashboardmenu/CateTree'
import LeftMenuAccount from './LeftMenuAccount';
import Storeview from "src/simi/BaseComponents/Settings/Storeview";
import Currency from "src/simi/BaseComponents/Settings/Currency"
import { toggleDrawer, closeDrawer } from 'src/actions/app';
import { connect } from 'src/drivers';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

class LeftMenuContent extends React.Component{

    constructor(props) {
        super(props);
        this.parent=this.props.parent;
    }
    
    getBrowserHistory = () => {
        return this.props.history
    }

    handleLink = (link) => {
        this.getBrowserHistory().push(link);
        this.handleCloseMenu()
    }

    handleMenuItem =(item)=>{
        if(item && item.url){
            this.handleLink(item.url)
        } else if (item && item.pathname) {
            this.handleLink(item)
        }
    }

    handleShowMenu = () => {
        this.props.openNav()
    }

    handleCloseMenu = () => {
        this.props.hideNav()
    }
    
    renderSections() {
        const {isSignedIn} = this.props
        const merchantConfigs = Identify.getStoreConfig();
        return (
            <React.Fragment>
                <div className="left-cats-menu">
                    <CateTree classes={{
                            'menu-content':'menu-content',
                            'icon-menu':'icon-menu',
                            'menu-title':'menu-title',
                            'menu-cate-name-item':'menu-cate-name-item',
                            'root-menu': 'root-menu',
                            'cate-parent-item' : 'cate-parent-item',
                            'sub-cate-root':'sub-cate-root',
                            'cate-child-item': 'cate-child-item',
                            'cate-icon': 'cate-icon',
                            'cate-root': 'cate-root',
                        }}
                        handleMenuItem={this.handleMenuItem.bind(this)} hideHeader={false}/>
                </div>
                { isSignedIn 
                ?
                    <LeftMenuAccount handleMenuItem={this.handleMenuItem.bind(this)} />
                :   null
                }
                {
                    merchantConfigs && 
                    <div className="left-store-switch">
                        <div className="storeview-switcher">
                            <Storeview classes={{}} className="storeview"/>
                        </div>
                        <div className="currency-switcher">
                            <Currency classes={{}} className="currency"/>
                        </div>
                    </div>
                }
                <div className="left-contact-us">
                    {Identify.__('Contact us 24/7: 84 - 24 - 6651 - 7968 (GMT+7)')}
                </div>

                { isSignedIn 
                ? '' :
                <div className="left-bottom-menu">
                    <div 
                        role="presentation" 
                        onClick={() => this.handleLink('/login.html')}>
                        {Identify.__('Login')}
                    </div>
                </div>
                }
            </React.Fragment>
        )
    }

    render(){
        return (
            <div className="list-menu-header" style={{maxHeight:window.innerHeight}}>
                <div className="left-top-menu">
                    {this.renderSections()}
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    openNav: () => dispatch(toggleDrawer('nav')),
    hideNav: () => dispatch(closeDrawer('nav'))
});

export default compose(connect(null, mapDispatchToProps), withRouter)(LeftMenuContent);
