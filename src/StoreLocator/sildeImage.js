import React from 'react'
import Carousel from 'react-elastic-carousel'
import Item from './Item'
const SlideImage = (props) => {
    const { location } = props
    let listImage
    let renderCarousel
    if (location !== null) {
        listImage =  JSON.parse(location.images)
        const itemImage = listImage.map(item => <Item>
            <img src={item.file} width="100%"/>
        </Item>)
         renderCarousel = location.images !== '[]' ? (<Carousel itemsToShow={5}>
            {itemImage}
        </Carousel>) : null
        return renderCarousel;
    }

    return (
        <div>
            {renderCarousel}
        </div>

    )
}

export default SlideImage
