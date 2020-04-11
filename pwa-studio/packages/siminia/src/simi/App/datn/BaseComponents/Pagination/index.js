import React from 'react';
import PropTypes from 'prop-types';
import Identify from 'src/simi/Helper/Identify';
import BackIcon from 'src/simi/BaseComponents/Icon/TapitaIcons/Back'
import NextIcon from 'src/simi/BaseComponents/Icon/TapitaIcons/Next'

class Pagination extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            currentPage : this.props.currentPage,
            limit : this.props.limit,
            data : this.props.data,
            itemCount : this.props.itemCount
        }
        this.startPage = 1;
        this.endPage = this.startPage + 3;
    }

    changePage(event) {
        this.setState({
            currentPage: Number(event.target.id)
        });
        if (this.props.changedPage) {
            this.props.changedPage(event.target.id)
        }
    }

    changeLimit = (event) => {
        this.startPage = 1;
        this.endPage = this.startPage + 3;
        this.setState({
            limit: Number(event.target.value),
            currentPage : 1
        });
        if (this.props.changeLimit) {
            this.props.changeLimit(event.target.value)
        }
    };

    renderItem =(item, index)=>{
        return this.props.renderItem(item, index)
    };

    handleChangePage =(next = true)=>{
        const currentPage = next ? this.state.currentPage + 1 : this.state.currentPage - 1;
        if(currentPage > this.endPage){
            this.startPage = this.startPage + 1;
            this.endPage = this.endPage + 1;
        }else if (currentPage < this.startPage){
            this.startPage = this.startPage - 1;
            this.endPage = this.endPage - 1;
        }
        this.setState({
            currentPage : currentPage
        })
        if (this.props.changedPage) {
            this.props.changedPage(event.target.id)
        }
    }

    renderPageNumber = (total)=>{
        // Logic for displaying page numbers
        if(!this.props.showPageNumber) return null;
        const pageNumbers = [];
        const totalItem = total;
        const {classes} = this.props
        total =  Math.ceil(total / this.state.limit);
        const endpage = this.endPage > total ? total : this.endPage
        for (let i = this.startPage; i <= endpage; i++) {
            pageNumbers.push(i);
        }
        const obj = this;
        const renderPageNumbers = pageNumbers.map(number => {
            let active = number === obj.state.currentPage ?
                {
                    color: '#808080',
                    textDecoration: 'underline'
                } : {};
            active = {
                ...{
                    fontWeight : 400,
                    fontSize: 16,
                    lineHeght: 19,
                    display : 'inline-block',
                    textAlign: 'center',
                    paddingTop: 5,
                    cursor : 'pointer',
                    color: '#000'
                },
                ...active,
                
            };
            return (
                <li
                    role="presentation"
                    key={number}
                    id={number}
                    onClick={(e)=>this.changePage(e)}
                    style={active}
                >
                    {number}
                </li>
            );
        });
        const option_limit = [];
        if (this.props.itemsPerPageOptions)
        {
            this.props.itemsPerPageOptions.map((item) => {
                    option_limit.push(<option key={Identify.randomString(5)} value={item} onBlur={this.renderItem}>{item}</option>);
                    return null    
                }
            );
        }
        let nextPageIcon = null;
        let prevPageIcon = null;
        if(this.endPage < total && this.state.currentPage <= this.endPage){
            nextPageIcon = <NextIcon style={{width: 6}}/>;
        }
        if(this.state.currentPage >= this.startPage && this.endPage > 4){
            prevPageIcon = <BackIcon style={{width: 6}}/>;
        }
        const pagesSelection = (total>1)?(
            <ul id="page-numbers" classes={classes["page-numbers"]} style={{
                border : 'none',
                padding : 0,
                display : 'flex',
                alignItems : 'center',
                fontSize : 14
            }}>
                <li role="presentation" className={classes["icon-page-number"]} style={{padding: '6px 6px 0 6px', cursor: 'pointer'}} onClick={()=>this.handleChangePage(false)}>{'('}</li>
                    {renderPageNumbers}
                <li role="presentation" className={classes["icon-page-number"]} style={{padding: '6px 6px 0 6px', cursor: 'pointer'}} onClick={()=>this.handleChangePage(true)}>{')'}</li>
            </ul>
        ):'';
        const {currentPage,limit} = this.state;
        let lastItem = currentPage * limit;
        const firstItem = lastItem - limit+1;
        lastItem = lastItem > totalItem ? totalItem : lastItem;
        const itemsPerPage = (
            <div className={"items-per-page"} style={{marginLeft : 'auto'}}>
                {
                    this.props.showInfoItem &&
                    <span style={{marginRight : 10,fontSize : 16}}>
                        {Identify.__('Items %a - %b of %c').replace('%a', firstItem).replace('%b', lastItem).replace('%c', totalItem)}
                    </span>
                }
                {this.showItemPerPage && <span style={{fontWeight : 600,fontSize : 16}}>{Identify.__('Show')}</span>}
                {this.showItemPerPage && <span className={classes["items-per-page-select"]}  style={{
                    margin : '0 5px',
                    background: 'none'
                }}>
                        <select 
                                value={this.state.limit}
                                id="limit"
                                onBlur={()=>{}}
                                onChange={(e)=>this.changeLimit(e)}
                                style={{
                                    border: 'none',
                                    borderRadius: '0',
                                    borderBottom: 'solid #2d2d2d 1px',
                                    fontSize : 14
                                }}
                        >
                            {option_limit}
                        </select>
                    </span>}
                {this.showItemPerPage && <span style={{fontWeight : 400,fontSize : 16}}>{Identify.__('per page')}</span>}
            </div>
        );
        
        return (
            <div className={"config-page"}
                 style={{
                     display : 'flex',
                     alignItems : 'center',
                     justifyContent : 'space-between',
                     marginTop: 30
                 }}
            >
                {pagesSelection}
                {itemsPerPage}
            </div>
        )
    };

    renderPagination = ()=>{
        console.log('run');
        //handle the case itemCount changed from parent
        if (this.props.itemCount !== this.state.itemCount) {
            this.setState({
                currentPage : 1,
                limit : this.props.limit,
                data : this.props.data,
                itemCount : this.props.itemCount
            })
        }
        
        const {data,currentPage, limit, itemCount} = this.state;
        const { classes } = this.props;
        if(data.length > 0){
            // Logic for displaying current todos
            const indexOfLastTodo = currentPage * limit;
            const indexOfFirstTodo = indexOfLastTodo - limit;
            const currentReview = data.slice(indexOfFirstTodo, indexOfLastTodo);
            const obj = this;
            const items = currentReview.map((item) => {
                return obj.renderItem(item);
            });
            const total = data.length;
            return (
                <React.Fragment>
                    <div className={"list-items"}>
                        {items}
                    </div>
                    {this.renderPageNumber(total)}
                </React.Fragment>
      
            )
        } else if (itemCount > 0) {
            return (
                <div className="pagination-list-items">
                    {this.renderItem()}
                    {this.renderPageNumber(itemCount)}
                </div>
            )
        }
        return <div></div>
    }

    render(){

        console.log('run');
        return this.renderPagination();
    }
}
/*
data OR itemCount is required to calculate pages count
 */

Pagination.defaultProps = {
    currentPage : 1,
    limit : 5,
    data: [],
    itemCount: 0,
    itemsPerPageOptions: [5, 10, 15, 20],
    table : false,
    showPageNumber : true,
    showInfoItem : true,
    showItemPerPage: true,
    classes : {},
};
Pagination.propTypes = {
    currentPage: PropTypes.number,
    limit: PropTypes.number,
    data: PropTypes.array,
    renderItem : PropTypes.func,
    itemCount: PropTypes.number,
    itemsPerPageOptions: PropTypes.array,
    classes: PropTypes.object,
    changedPage : PropTypes.func,
    changeLimit : PropTypes.func,
};
export default Pagination;