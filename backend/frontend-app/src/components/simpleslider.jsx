import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function SimpleSlider() {
    const settings = {
        dots: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 500,
    };

    const AfroStyles = [
        {
            id: 1,
            title: "Women Collection 2018",
            description:
                "NEW SEASON",
            alt: "Shop Now",
            src: '../images/slide-01.jpg',
        },
        {
            id: 2,
            title: "Model 2",
            description:
                "Elevate your style with this Ankara long sleeve shirt and trouser",
            alt: "Second Image",
            src: '../images/slide-02.jpg',
        },
        {
            id: 3,
            title: "Model 3",
            description: "Elevate your style with Ankara dresses.",
            alt: "Third Image",
            src: '../images/slide-03.jpg',
        }

    ];

    return (
        <section className="section-slide">
            <div className="wrap-slick1">
                <div className="slick1">
                    <Slider {...settings}>
                        {AfroStyles.map((item) => (
                            <div className="item-slick1" key={item.id}>
                                <div className="img-body">
                                    <img src={item.src} alt={item.alt} />
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </section>
    );
}