import React from 'react';
import PropTypes from 'prop-types';

const Tab = (props) => {
    const { label, onClick, activeTab } = props;

    let className = 'tab-list-item';

    if (activeTab === label) {
        className += ' tab-list-active';
    }

    const onClickTab = () => {
        onClick(label);
    }

    return (
        <li
            className={className}
            onClick={onClickTab}
        >
            {label}
        </li>
    );
}
Tab.PropTypes = {
    activeTab: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
}

export default Tab;
