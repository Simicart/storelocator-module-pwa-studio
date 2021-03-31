import React from "react";
import Anime from 'react-anime';

export class TestAnime_JiggleSquares extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clicked: 0
        };
    }


    increment = () => {
        this.setState((prevState, currProps) => ({
            clicked: prevState.clicked + 1
        }));
    };

    render() {
        let yo = this.state.clicked % 2 === 0;
        return (
            <div>
                {yo ? (
                    <Anime
                        easing="easeOutElastic"
                        loop={false}
                        autoplay={true}
                        duration={1000}
                        delay={(el, index) => index * 240}
                        translateX="13rem"
                        scale={[0.75, 0.9]}
                    >
                        <div className="blue" style={{backgroundColor: 'blue', width: 10, height: 10}}/>
                    </Anime>
                ) : (
                    <Anime
                        easing="easeOutElastic"
                        loop={false}
                        autoplay={true}
                        duration={1000}
                        delay={(el, index) => index * 240}
                        translateX={yo ? "13rem" : "0rem"}
                        scale={[0.75, 0.9]}
                    >
                        <div className="green" style={{backgroundColor: 'green', width: 10, height: 10}}/>
                    </Anime>
                )}
                <a
                    style={{
                        display: "block",
                        width: 240,
                        cursor: "pointer",
                        userSelect: "none"
                    }}
                    onClick={this.increment}
                >
                    Trigger
                </a>
            </div>
        );
    }
}
