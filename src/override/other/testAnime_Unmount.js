import React, {Component} from "react";
import Anime from 'react-anime'

export default class TestAnime_Unmount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mounted: true
        }
    }

    dismount = () => {
        this.setState(({mounted}) => ({mounted: false}))
    }

    render() {
        const {mounted} = this.state

        const animeProps = {
            opacity: [0, 1],
            translateY: [-64, 0],
            delay: (el, i) => i * 200,
            duration: 2000,
            begin: () => console.log('begin'),
            complete: () => console.log('complete')
        }

        return (
            <Anime {...animeProps}>
                <h1 onClick={this.dismount}>Hello</h1>
            </Anime>
        )
    }
}
