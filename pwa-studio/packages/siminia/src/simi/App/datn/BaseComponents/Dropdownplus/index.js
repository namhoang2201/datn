import React from 'react'

const $ = window.$
class Dropdownplus extends React.Component {
    sliding = false
    handleShowContent() {
        if (this.sliding) return
        this.sliding = true
        const obj = this
        const elementTitle = this.props.id
        $(this.content).slideToggle('fast', function () {
            obj.sliding = false
            if ($(this).is(':visible')) {
                $(obj.plusIc).hide()
                $(obj.minusIc).show()
                $(`#${elementTitle}`).css('color', '#000')
            } else {
                $(obj.plusIc).show()
                $(obj.minusIc).hide()
                $(`#${elementTitle}`).css('color', '#333')
            }
        });
    }

    render() {
        const classes = this.props.classes ? this.props.classes : {}
        return (
            <div className={`${classes['dropdownplus']} ${this.props.className}`}>
                <div id={this.props.id} role="presentation" className={classes['dropdownplus-title']} onClick={() => this.handleShowContent()}>
                    {this.props.title}
                    <div
                        className={`dropdown-title-icon`}
                        ref={(item) => this.plusIc = item}>
                        <i className="icon-chevron-down icons"></i>
                    </div>
                    <div
                        className={`dropdown-title-icon`}
                        ref={(item) => this.minusIc = item}
                        style={{ display: 'none' }}>
                        <i className="icon-chevron-up icons"></i>
                    </div>
                </div>
                <div
                    className={classes["dropdownplus-inner"]}
                    ref={(item) => this.content = item}
                    style={{ display: this.props.expanded ? 'block' : 'none' }}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}
export default Dropdownplus