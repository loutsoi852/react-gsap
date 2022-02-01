import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";


import { useEffect, useRef, useState } from "react";
import "./styles8.css";
import stc from 'string-to-color'


gsap.registerPlugin(ScrollTrigger, Draggable);
gsap.registerPlugin(InertiaPlugin, ScrollToPlugin);

export default function MoreContent({ nav, setNav }) {
    console.log('mroe con tet')

    const animationsRef = useRef()
    const moreContainer = useRef()

    useEffect(() => {
        animationsRef.current = {
            moreFadeIn: gsap.fromTo(moreContainer.current, { opacity: 0, duration: 1 }, { opacity: 1, duration: 1 }),
        }

        return () => {
            animationsRef.current.moreFadeIn.pause().kill();
        };

    }, []);

    const back = () => {
        animationsRef.current.moreFadeIn.vars.onReverseComplete = () => {
            console.log('complete ereverse')
            setNav(null)
        }
        animationsRef.current.moreFadeIn.reverse()
    }

    return (
        <div style={{ display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', }}>
            <div ref={moreContainer} style={{ display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', background: 'white', opacity: 0 }}>
                <button onClick={() => back()}>back</button>
            </div>

        </div>
    );
}
