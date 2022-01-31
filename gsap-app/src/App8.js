import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

import { useEffect, useRef, useState } from "react";
import "./styles8.css";
import stc from 'string-to-color'


gsap.registerPlugin(ScrollTrigger, Draggable);
gsap.registerPlugin(InertiaPlugin);

export default function App() {
    const boxes = useRef([]);
    const createBoxesRefs = (panel, index) => {
        boxes.current[index] = panel;
    };
    const boxContainer = useRef();

    const boxes2 = useRef([]);
    const createBoxesRefs2 = (panel, index) => {
        boxes2.current[index] = panel;
    };
    const boxContainer2 = useRef();


    const dragProxyRef = useRef();
    const drag = useRef()
    const scroll1 = useRef()
    const scroll2 = useRef()
    const sTrigger = useRef()





    useEffect(() => {
        scroll1.current = gsap.to([boxes.current], {
            xPercent: -100 * (boxes.current.length - 1),
            ease: "none",
            paused: true,
            // scrollTrigger: {
            //     trigger: boxContainer2.current,
            //     pin: true,
            //     scrub: true,
            //     start: 0,
            //     snap: {
            //         snapTo: 1 / (boxes.current.length - 1),//"labels", // snap to the closest label in the timeline
            //         //duration: { min: 0.2, max: 2 }, // the snap animation should be at least 0.2 seconds, but no more than 3 seconds (determined by velocity)
            //         delay: 0, // wait 0.2 seconds from the last scroll event before doing the snapping
            //         //ease: "none", // the ease of the snap animation ("power3" by default)
            //     },
            //     end: () => "+=4000",
            //     onUpdate(self) {
            //         if (self.progress === 1 && self.direction > 0 && !self.rotating) {
            //             self.rotating = true
            //             self.scroll(self.start + 1);
            //             self.update()
            //         } else if (self.progress < 1e-5 && self.direction < 0 && !self.rotating) {
            //             self.rotating = true
            //             self.scroll(self.end - 1);
            //             self.update()
            //         } else {
            //             self.rotating = false
            //         }
            //     },
            // }
        });


        scroll2.current = gsap.to([boxes2.current], {
            xPercent: -100 * (boxes2.current.length - 1),
            ease: "none",
            paused: true,
            // scrollTrigger: {
            //     trigger: boxContainer2.current,
            //     pin: true,
            //     scrub: true,
            //     start: 0,
            //     snap: {
            //         snapTo: 1 / (boxes.current.length - 1),//"labels", // snap to the closest label in the timeline
            //         //duration: { min: 0.2, max: 2 }, // the snap animation should be at least 0.2 seconds, but no more than 3 seconds (determined by velocity)
            //         delay: 0, // wait 0.2 seconds from the last scroll event before doing the snapping
            //         //ease: "none", // the ease of the snap animation ("power3" by default)
            //     },
            //     end: () => "+=4000",
            //     onUpdate(self) {
            //         if (self.progress === 1 && self.direction > 0 && !self.rotating) {
            //             self.rotating = true
            //             self.scroll(self.start + 1);
            //             self.update()
            //         } else if (self.progress < 1e-5 && self.direction < 0 && !self.rotating) {
            //             self.rotating = true
            //             self.scroll(self.end - 1);
            //             self.update()
            //         } else {
            //             self.rotating = false
            //             // self.scroll(self.progress - 1)
            //         }
            //     },
            // }
        });



        sTrigger.current = ScrollTrigger.create({
            pin: boxContainer2.current,
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
                if (self.progress === 1 && self.direction > 0 && !self.rotating) {
                    console.log('forward')
                    self.rotating = true
                    self.scroll(self.start + 1);
                    self.update()
                } else if (self.progress < 1e-5 && self.direction < 0 && !self.rotating) {
                    console.log('back')
                    self.rotating = true
                    self.scroll(self.end - 1);
                    self.update()
                } else {
                    self.rotating = false
                    scroll1.current.progress(self.progress)
                    scroll2.current.progress(1 - self.progress)
                }
            },
        });


        drag.current = Draggable.create(dragProxyRef.current, {
            type: "x",
            trigger: boxes.current,
            // inertia: { x: 500 },
            throwProps: true,
            onPress() {
                this.startOffset = sTrigger.current.scroll();
            },
            onDrag() {
                let ST = sTrigger.current
                const dragDiff = this.startX - this.x

                if ((ST.progress < 1e-5 || ST.progress > 0.99) && this.getDirection() === 'left' && !ST.rotating) {
                    console.log('rotate 1')
                    ST.rotating = true
                    this.startOffset = ST.start - dragDiff
                    ST.scroll(ST.start + 5)
                    return
                }

                if ((ST.progress < 1e-5 || ST.progress > 0.99) && this.getDirection() === 'right' && !ST.rotating) {
                    console.log('rotate 2')
                    ST.rotating = true
                    if (this.startOffset < ST.end) {
                        this.startOffset = ST.end - dragDiff
                        ST.scroll(ST.end - 5);
                        return
                    }
                }

                ST.rotating = false
                ST.scroll(this.startOffset + dragDiff)

            },
            onThrowUpdate() {
                console.log('throwing')
                let ST = sTrigger.current
                const dragDiff = this.startX - this.x

                if ((ST.progress < 1e-5 || ST.progress > 0.99) && this.getDirection() === 'left' && !ST.rotating) {
                    console.log('rotate 1')
                    ST.rotating = true
                    this.startOffset = ST.start - dragDiff
                    ST.scroll(ST.start + 5)
                    return
                }

                if ((ST.progress < 1e-5 || ST.progress > 0.99) && this.getDirection() === 'right' && !ST.rotating) {
                    console.log('rotate 2')
                    ST.rotating = true
                    if (this.startOffset < ST.end) {
                        this.startOffset = ST.end - dragDiff
                        ST.scroll(ST.end - 5);
                        return
                    }
                }

                ST.rotating = false
                ST.scroll(this.startOffset + dragDiff)
            }
        });



    }, []);

    return (
        <>
            <div ref={boxContainer2} style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
                <div ref={boxContainer} style={{ display: 'flex', height: '100%', width: '90vw', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <div ref={(e) => createBoxesRefs(e, 0)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("0"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>0</div>
                    <div ref={(e) => createBoxesRefs(e, 1)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("1"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>1</div>
                    <div ref={(e) => createBoxesRefs(e, 2)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("2"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>2</div>
                    <div ref={(e) => createBoxesRefs(e, 3)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("3"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>3</div>
                    <div ref={(e) => createBoxesRefs(e, 4)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("4"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>4</div>
                    <div ref={(e) => createBoxesRefs(e, 5)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("5"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>5</div>
                    <div ref={(e) => createBoxesRefs(e, 6)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("0"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>0</div>
                </div>
                <div style={{ display: 'flex', height: '100%', width: '90vw', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <div ref={(e) => createBoxesRefs2(e, 0)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("0"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>0</div>
                    <div ref={(e) => createBoxesRefs2(e, 1)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("1"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>1</div>
                    <div ref={(e) => createBoxesRefs2(e, 2)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("2"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>2</div>
                    <div ref={(e) => createBoxesRefs2(e, 3)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("3"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>3</div>
                    <div ref={(e) => createBoxesRefs2(e, 4)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("4"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>4</div>
                    <div ref={(e) => createBoxesRefs2(e, 5)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("5"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>5</div>
                    <div ref={(e) => createBoxesRefs2(e, 6)} style={{ height: '40vh', width: '100vw', minWidth: '100vw', backgroundColor: stc("0"), display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2em' }}>0</div>
                </div>
            </div>
            <div ref={dragProxyRef}></div>
        </>
    );
}
