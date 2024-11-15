import React from 'react';
import './Carousel.css'
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';

interface CarouselType {
  images: string[],
}

const CarouselComponent: React.FC<CarouselType> = ({images}) => {
  return (
    <Carousel      
    showStatus={false}
    useKeyboardArrows = {true}
    autoPlay={true}
    showThumbs={false}
    >
      {images.map((img, index) => (
        <div key={index}>
          <img width={900} height={550} src={img} alt={`Slide ${index + 1}`} />
        </div>
      ))}
    </Carousel>
  )
}

export default CarouselComponent