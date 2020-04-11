import React, { Component } from 'react';
import {Carousel} from "react-responsive-carousel";
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Identify from "src/simi/Helper/Identify";

class CarouselBase extends Component {
    constructor(props){
        super(props)
        this.SlideToShow = this.props.showNumber;
    }

    renderCarousel (data) {
        const slideSettings = {
            autoPlay: this.props.autoPlay,
            showArrows: this.props.showArrows,
            showThumbs: this.props.showThumbs,
            showIndicators: this.props.showIndicators,
            showStatus: this.props.showStatus,
            infiniteLoop: this.props.infiniteLoop,
            lazyLoad: this.props.lazyLoad,
        };

        const totalItem = data.length;
        const totalSlide = Math.ceil(totalItem/this.SlideToShow);
        this.totalSlide = totalSlide
        const slides = [];
        // let w = 100/this.SlideToShow + '%';
        for (let i = 0 ; i < totalSlide ; i++){
            const start = this.SlideToShow*i;
            const end = this.SlideToShow * (i+1);
            const items = data.slice(start,end).map((item,key) => {
                return this.props.renderItems(item, key)
            });
            const slide = <div className="carousel-lists" key={i}>
                        {items}
                    </div>;
            Identify.isRtl() ?  slides.unshift(slide) : slides.push(slide);
        }
        return (
            <Carousel {...slideSettings} selectedItem={Identify.isRtl() ? totalSlide-1 : 0} className={this.props.className}>
                {slides}
            </Carousel>
        )
    }

    render(){
        return (
            <div className={this.props.className + '-container'}>
                {this.props.data && this.renderCarousel(this.props.data)}
            </div>
        )
    }
}

CarouselBase.defaultProps = {
    infiniteLoop: true,
    autoPlay: true,
    showArrows: true,
    showThumbs: false,
    showIndicators: false,
    showStatus: false,
    lazyLoad: true,
    className: 'slide',
    showNumber: 1,
    data: []
}

export default CarouselBase;
