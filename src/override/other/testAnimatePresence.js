import React from "react";
import {useAnimatePresence} from "use-animate-presence";

const variants = {
    x: {from: -800, to: 0},
};

export default function TestAnimatePresence() {
    const animatedDiv = useAnimatePresence({
        variants,
        initial: "visible",
        debugName: ''
    });

    return (
        <div>
            <button onClick={() => animatedDiv.togglePresence()}>Toggle</button>
            {animatedDiv.isRendered &&
            <div ref={animatedDiv.ref} style={{backgroundColor: 'deeppink', width: 20, height: 20}}/>}
        </div>
    );
}
