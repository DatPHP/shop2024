import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", background: "#42464a", right: 25 + 'px' }}
        onClick={onClick}
      />
    );
  }
  
  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", background: "#42464a", left: 25 + 'px', zIndex: 1 }}
        onClick={onClick}
      />
    );
  }

export default function SimpleSlider() {
    const [nav1, setNav1] = useState(null);
    let sliderRef1 = useRef(null);
    const settings = {
        dots: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 1000,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />
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

    useEffect(() => {
      setNav1(sliderRef1);
    }, []);

    return (
        <section className="section-slide">
            <div className="wrap-slick1">
                <div className="slick1">
                    <Slider {...settings}
                    asNavFor={nav1} ref={slider => (sliderRef1 = slider)}
                    >
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