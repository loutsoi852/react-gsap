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

export default function Slider({ nav, setNav }) {
    console.log('slidr')
    const boxContainer = useRef();
    const boxes = useRef([]);
    const menus = useRef([]);
    const dragProxyRef = useRef();
    const drag = useRef()
    const scroll = useRef()
    const sTrigger = useRef()
    const menuTweens = useRef()
    const animationsRef = useRef()
    const createBoxesRefs = (panel, index) => {
        boxes.current[index] = panel;
    };
    const createMenusRefs = (panel, index) => {
        menus.current[index] = panel;
    };


    const dragUpdate = (self, isThrow) => {
        let ST = sTrigger.current
        const dragDiff = self.startX - self.x
        if ((ST.progress < 1e-5 || ST.progress > 0.99) && self.getDirection() === 'left' && !ST.rotating) {
            // console.log('rotate 1')
            ST.rotating = true
            self.startOffset = ST.start - dragDiff
            ST.scroll(ST.start + 5)
            return
        }
        if ((ST.progress < 1e-5 || ST.progress > 0.99) && self.getDirection() === 'right' && !ST.rotating) {
            // console.log('rotate 2')
            ST.rotating = true
            if (self.startOffset < ST.end || isThrow) {
                self.startOffset = ST.end - dragDiff
                ST.scroll(ST.end - 5);
                return
            }
        }
        ST.rotating = false
        ST.scroll(self.startOffset + dragDiff)
    }

    const checkMenuViewPortStatus = () => {
        boxes.current.forEach((box, i) => {
            if (ScrollTrigger.isInViewport(box, 0.8, true)) {
                const MT = menuTweens.current[i !== 6 ? i : 0]
                // if (!MT.isActive()) MT.restart()
                MT.play()
            }
            if (!ScrollTrigger.isInViewport(box, 0.4, true)) {
                const MT = menuTweens.current[i !== 6 ? i : 0]
                // if (!MT.isActive()) MT.restart()
                if (!MT.reversed()) MT.reverse()
            }
        })
    }
    const scrollUpdate = (self) => {
        checkMenuViewPortStatus()
        // console.log(self.progress)

        if (self.progress === 1 && self.direction > 0 && !self.rotating) {
            // console.log('forward')
            self.rotating = true
            self.scroll(self.start + 1);
            self.update()
        } else if (self.progress < 1e-5 && self.direction < 0 && !self.rotating) {
            // console.log('back')
            self.rotating = true
            self.scroll(self.end - 1);
            self.update()
        } else {
            self.rotating = false
            scroll.current.progress(self.progress)
        }
    }


    const jumpToBox = (n) => {
        console.log('jumpToBox ', n)
        const ST = sTrigger.current
        const scrollPx = (ST.end / 6) * n
        // ST.scroll(scrollPx)
        // ST.update()
        // checkMenuViewPortStatus()
        gsap.to(window, { duration: 1, scrollTo: scrollPx });
    }


    const viewMore = () => {
        animationsRef.current.menuFadeIn.vars.onReverseComplete = () => {
            sTrigger.current.kill();
            setNav('more')
        }
        animationsRef.current.menuFadeIn.reverse()
        // setNav('more')
    }
    useEffect(() => {

        animationsRef.current = {
            menuFadeIn: gsap.fromTo(boxContainer.current, { opacity: 0, duration: 1 }, { opacity: 1, duration: 1, zIndex: 10 }),
        }

        menuTweens.current = menus.current.map(menu => {
            return gsap.fromTo(menu, { scale: 1, duration: 0.1, paused: true }, { scale: 2, duration: 0.1, paused: true, zIndex: 10 })
        })

        // menuTweens.current = menus.current.forEach(menu => {
        //     menu.onClick(() => { console.log('asdfsa') })
        // })

        scroll.current = gsap.to([boxes.current], {
            xPercent: -100 * (boxes.current.length - 1),
            ease: "none",
            paused: true,
        });


        sTrigger.current = ScrollTrigger.create({
            id: 'sTrigger',
            pin: boxContainer.current,
            scrub: true,
            start: 0,
            snap: {
                snapTo: 1 / (boxes.current.length - 1),//"labels", // snap to the closest label in the timeline
                //duration: { min: 0.2, max: 2 }, // the snap animation should be at least 0.2 seconds, but no more than 3 seconds (determined by velocity)
                delay: 0, // wait 0.2 seconds from the last scroll event before doing the snapping
                //ease: "none", // the ease of the snap animation ("power3" by default)
            },
            end: () => "+=4000",
            onUpdate(self) {
                scrollUpdate(self)
            },
        });


        drag.current = Draggable.create(dragProxyRef.current, {
            type: "x",
            trigger: boxes.current,
            throwProps: true,
            inertia: true,
            resistance: 0.1,
            onPress() {
                this.startOffset = sTrigger.current.scroll();
            },
            onDrag() {
                dragUpdate(this, false)
            },
            onThrowUpdate() {
                console.log('isThrow')
                dragUpdate(this, true)
            }
        });


        return () => {
            scroll.current.pause().kill();
            animationsRef.current.menuFadeIn.pause().kill();
            menuTweens.current.forEach(m => m.pause().kill())
        };

    }, []);



    return (
        <div ref={boxContainer} style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', opacity: 0 }}>
            <div style={{ display: 'flex', height: '100px', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <div onClick={() => jumpToBox(0)} ref={(e) => createMenusRefs(e, 0)} style={{ height: '50px', width: '50px', backgroundColor: stc("0"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.5em', cursor: 'pointer' }}>0</div>
                <div onClick={() => jumpToBox(1)} ref={(e) => createMenusRefs(e, 1)} style={{ height: '50px', width: '50px', backgroundColor: stc("1"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.5em', cursor: 'pointer' }}>1</div>
                <div onClick={() => jumpToBox(2)} ref={(e) => createMenusRefs(e, 2)} style={{ height: '50px', width: '50px', backgroundColor: stc("2"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.5em', cursor: 'pointer' }}>2</div>
                <div onClick={() => jumpToBox(3)} ref={(e) => createMenusRefs(e, 3)} style={{ height: '50px', width: '50px', backgroundColor: stc("3"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.5em', cursor: 'pointer' }}>3</div>
                <div onClick={() => jumpToBox(4)} ref={(e) => createMenusRefs(e, 4)} style={{ height: '50px', width: '50px', backgroundColor: stc("4"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.5em', cursor: 'pointer' }}>4</div>
                <div onClick={() => jumpToBox(5)} ref={(e) => createMenusRefs(e, 5)} style={{ height: '50px', width: '50px', backgroundColor: stc("5"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.5em', cursor: 'pointer' }}>5</div>
            </div>
            <div style={{ display: 'flex', height: '100%', width: '90vw', justifyContent: 'flex-start', alignItems: 'center' }}>
                <div ref={(e) => createBoxesRefs(e, 0)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("0"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>
                    <button onClick={() => viewMore()}>View More</button>
                </div>
                <div ref={(e) => createBoxesRefs(e, 1)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("1"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>1</div>
                <div ref={(e) => createBoxesRefs(e, 2)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("2"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>2</div>
                <div ref={(e) => createBoxesRefs(e, 3)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("3"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>3</div>
                <div ref={(e) => createBoxesRefs(e, 4)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("4"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>4</div>
                <div ref={(e) => createBoxesRefs(e, 5)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("5"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>5</div>
                <div ref={(e) => createBoxesRefs(e, 6)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("0"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>0</div>
            </div>
            <div ref={dragProxyRef}></div>
        </div>

    );
}
