import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

import { useEffect, useRef, useState } from "react";
import "./styles7.css";
import stc from 'string-to-color'


gsap.registerPlugin(ScrollTrigger, Draggable);


export default function App() {
    const boxes = useRef([]);
    const createBoxesRefs = (panel, index) => {
        boxes.current[index] = panel;
    };
    const dragProxyRef = useRef();
    const scrubRef = useRef();





    useEffect(() => {
        console.log('useEffect')
        const STAGGER = 0.35
        const DURATION = 1
        const OFFSET = 0
        const BOXES = boxes.current

        const LOOP = gsap.timeline({
            paused: true,
            repeat: -1,
            ease: 'none'
        })

        const SHIFTS = [...BOXES, ...BOXES, ...BOXES]


        SHIFTS.forEach((BOX, index) => {
            const BOX_TL = gsap
                .timeline()
                .fromTo(
                    BOX,
                    {
                        xPercent: 100,
                    },
                    {
                        xPercent: -200,
                        duration: 1,
                        ease: 'none',
                        immediateRender: false,
                    }, 0
                )
                .fromTo(
                    BOX, {
                    opacity: 0,
                }, {
                    opacity: 1,
                    duration: 0.25,
                    repeat: 1,
                    repeatDelay: 0.5,
                    immediateRender: false,
                    ease: 'none',
                    yoyo: true,
                }, 0)
                .fromTo(
                    BOX,
                    {
                        scale: 1,
                    },
                    {
                        scale: 1,
                        repeat: 1,
                        zIndex: BOXES.length,
                        yoyo: true,
                        ease: 'none',
                        duration: 0.5,
                        immediateRender: false,
                    },
                    0
                )
            LOOP.add(BOX_TL, index * STAGGER)
        })


        const CYCLE_DURATION = STAGGER * BOXES.length
        const START_TIME = CYCLE_DURATION + (DURATION * 0.5) + OFFSET
        const END_TIME = START_TIME + CYCLE_DURATION

        const LOOP_HEAD = gsap.fromTo(LOOP, {
            totalTime: START_TIME,
        },
            {
                totalTime: `+=${CYCLE_DURATION}`,
                duration: 1,
                ease: 'none',
                repeat: -1,
                paused: true,
            })


        const PLAYHEAD = {
            position: 0
        }

        const POSITION_WRAP = gsap.utils.wrap(0, LOOP_HEAD.duration())

        const SCRUB = gsap.to(PLAYHEAD, {
            position: 0,
            onUpdate: () => {
                LOOP_HEAD.totalTime(POSITION_WRAP(PLAYHEAD.position))
            },
            paused: true,
            duration: 0.5,
            ease: 'none',
        })

        let iteration = 0
        const WRAP = (iterationDelta, scrollTo, TRIGGER) => {
            iteration += iterationDelta
            TRIGGER.scroll(scrollTo)
            TRIGGER.update()
        }

        const TRIGGER = ScrollTrigger.create({
            start: 0,
            end: '+=10000',
            horizontal: false,
            pin: '.boxes',
            onUpdate: self => {
                const SCROLL = self.scroll()
                console.log(iteration, SCRUB.vars.position)
                if (SCROLL > self.end - 1) {
                    // Go forwards in time
                    // WRAP(1, 1, self)
                    iteration += 1
                    self.disable()
                    self.scroll(1)
                    self.enable()
                    self.update()

                } else if (SCROLL < 1 && self.direction < 0) {
                    // Go backwards in time
                    // WRAP(-1, self.end - 1, self)
                    iteration += -1
                    self.scroll(self.end - 1)
                    self.update()

                } else {
                    SCRUB.vars.position = (iteration + self.progress) * LOOP_HEAD.duration()
                    SCRUB.invalidate().restart()
                }
            }
        })



        const SNAP = gsap.utils.snap(1 / BOXES.length)
        const progressToScroll = progress => gsap.utils.clamp(1, TRIGGER.end - 1, gsap.utils.wrap(0, 1, progress) * TRIGGER.end)
        const scrollToPosition = position => {
            const SNAP_POS = SNAP(position)
            const PROGRESS = (SNAP_POS - LOOP_HEAD.duration() * iteration) / LOOP_HEAD.duration()
            const SCROLL = progressToScroll(PROGRESS)
            console.log(SNAP_POS, PROGRESS, SCROLL)
            if (PROGRESS >= 1 || PROGRESS < 0) return WRAP(Math.floor(PROGRESS), SCROLL)
            TRIGGER.scroll(SCROLL)
        }
        ScrollTrigger.addEventListener('scrollEnd', () => scrollToPosition(SCRUB.vars.position))


        Draggable.create(dragProxyRef.current, {
            type: "x",
            trigger: boxes.current,
            onPress() {
                this.startOffset = SCRUB.vars.position;
            },
            onDrag() {
                SCRUB.vars.position = this.startOffset + (this.startX - this.x) * 0.0001;
                SCRUB.invalidate().restart(); // same thing as we do in the ScrollTrigger's onUpdate
            },
            onDragEnd() {
                scrollToPosition(SCRUB.vars.position);
            }
        });

    }, []);

    return (
        <>
            <div className="boxes">
                <div className="box" ref={(e) => createBoxesRefs(e, 0)}>0</div>
                <div className="box" ref={(e) => createBoxesRefs(e, 1)}>1</div>
                <div className="box" ref={(e) => createBoxesRefs(e, 2)}>2</div>
                <div className="box" ref={(e) => createBoxesRefs(e, 3)}>3</div>
                <div className="box" ref={(e) => createBoxesRefs(e, 4)}>4</div>
                <div className="box" ref={(e) => createBoxesRefs(e, 5)}>5</div>
            </div>
            <div className="drag-proxy" ref={dragProxyRef}></div>
        </>
    );
}
