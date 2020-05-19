import React from './node_modules/react'
import ReactDom from './node_modules/react-dom'
import PropTypes from './node_modules/prop-types'
import { withRouter, Link } from './node_modules/react-router-dom';

class BreadCrumb extends React.Component {
    renderBreadcrumb = data => {
        if (data.length > 0) {
            const size = data.length;
            const breadcrumb = data.map((item, key) => {
                const arrow = size === key + 1 ? null : <span className="breadcrumb-arrow"> / </span>
                return (
                    <React.Fragment key={key}>
                        <Link to={item.link ? item.link : '#'} className="breadcrumb-item">
                            {item.name}
                        </Link>
                        {arrow}
                    </React.Fragment>
                )
            }, this)
            return breadcrumb
        }
    }

    renderView = () => {
        const { breadcrumb } = this.props || [];
        if (breadcrumb.length < 1) return null;
        return (
            <div className="container">
                <div className="siminia-breadcrumb">
                    {this.renderBreadcrumb(breadcrumb)}
                </div>
            </div>
        );
    }

    render() {
        if (document.getElementById('data-breadcrumb'))
            return ReactDom.createPortal(
                this.renderView(),
                document.getElementById('data-breadcrumb'),
            );
        return ''
    }
}
BreadCrumb.propTypes = {
    breadcrumb: PropTypes.array.isRequired,
    history: PropTypes.object
}

export default withRouter(BreadCrumb)
