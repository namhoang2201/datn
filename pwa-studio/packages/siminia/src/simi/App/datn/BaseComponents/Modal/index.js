import React from 'react';
import { bool, string } from 'prop-types';
import Identify from 'src/simi/Helper/Identify';

require('./style.scss');

const Modal = props => {
    const { id, useClose } = props;

    const handleClosePopup = () => {
        if (document.getElementById(`${id}`)) {
            document.getElementById(`${id}`).style.display = "none";
        }
    }

    const renderJs = () => {
        window.onclick = function (event) {
            if (event.target == document.getElementById(`${id}`)) {
                document.getElementById(`${id}`).style.display = "none";
            }
        }
    }

    return <div id={id} className="app-modal-popup modal">
        <div className="modal-content">
            {useClose && <span className="icon-cross" onClick={() => handleClosePopup()} />}
            <div className="popup-main-content">
                {props.children}
            </div>
        </div>
        {useClose && renderJs()}
    </div>
}

Modal.propTypes = {
    id: string,
    useClose: bool
};

Modal.defaultProps = {
    id: "app-modal-popup",
    useClose: true
};

export default Modal;
