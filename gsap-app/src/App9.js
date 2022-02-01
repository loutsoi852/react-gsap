import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";


import { useEffect, useRef, useState } from "react";
import "./styles8.css";
import stc from 'string-to-color'
import Slider from './Slider';
import MoreContent from './MoreContent';


gsap.registerPlugin(ScrollTrigger, Draggable);
gsap.registerPlugin(InertiaPlugin, ScrollToPlugin);

export default function App() {

    const moreContainer = useRef()
    const [nav, setNav] = useState(null)

    return (
        <>
            {!nav && <Slider {...{ setNav, nav }} />}
            {nav === 'more' && <MoreContent {...{ setNav, nav }} />}
        </>
    );
}
