import React from 'react';
import { BasicText, asField } from 'informed';
require ('./customInput.scss')

const TextInputCustom = asField(({ fieldState, ...props }) => (
    <React.Fragment>
        {props.iconClassName && <i className={props.iconClassName} style={fieldState.error ? { color: '#B91C1C' } : null}></i>}
        <BasicText
            fieldState={fieldState}
            {...props}
            style={fieldState.error ? { border: 'solid 1px #B91C1C' } : null}
        />
        {fieldState.error ? (
            <p style={{ color: '#B91C1C' }}>{fieldState.error}</p>
        ) : null}
    </React.Fragment>
));

export default TextInputCustom