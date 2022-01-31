import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

import { useEffect, useRef, useState } from "react";
import "./styles6.css";
import stc from 'string-to-color'


gsap.registerPlugin(ScrollTrigger, Draggable);


export default function App() {
    let iteration = 0; // gets iterated when we scroll all the way to the end or start and wraps around - allows us to smoothly continue the playhead scrubbing in the correct direction.
    let wrapping = false;
    let timeout = 0

    const cards = useRef([]);
    const createCardsRefs = (panel, index) => {
        cards.current[index] = panel;
    };
    const dragProxyRef = useRef();
    const seamlessLoopRef = useRef();
    const scrubRef = useRef();
    const triggerRef = useRef();
    const gallerRef = useRef();
    const cardsContainerRef = useRef();

    const spacing = 0.1 // spacing of the cards (stagger)
    const snapTime = gsap.utils.snap(spacing) // we'll use this to snapTime the playhead on the seamlessLoop
    const playhead = { offset: 0 } // a proxy object we use to simulate the playhead position, but it can go infinitely in either direction and we'll just use an onUpdate to convert it to the corresponding time on the seamlessLoop timeline.


    function wrapForward(trigger) { // when the ScrollTrigger reaches the end, loop back to the beginning seamlessly
        iteration++;
        wrapping = true;
        trigger.scroll(trigger.start + 1);

    }

    function wrapBackward(trigger) { // when the ScrollTrigger reaches the start again (in reverse), loop back to the end seamlessly
        iteration--;
        if (iteration < 0) { // to keep the playhead from stopping at the beginning, we jump ahead 10 iterations
            iteration = 9;
            seamlessLoopRef.current.totalTime(seamlessLoopRef.current.totalTime() + seamlessLoopRef.current.duration() * 10);
            scrubRef.current.pause(); // otherwise it may update the totalTime right before the trigger updates, making the starting value different than what we just set above. 
        }
        wrapping = true;
        trigger.scroll(trigger.end - 1);
    }

    const wrap = (iterationDelta, scrollTo) => {
        iteration += iterationDelta;
        triggerRef.current.scroll(scrollTo);
        triggerRef.current.update(); // by default, when we trigger.scroll(), it waits 1 tick to update().
    }

    function scrubTo(totalTime) { // moves the scroll position to the place that corresponds to the totalTime value of the seamlessLoop, and wraps if necessary.
        let progress = (totalTime - seamlessLoopRef.current.duration() * iteration) / seamlessLoopRef.current.duration();
        if (progress > 1) {
            wrapForward(triggerRef.current);
        } else if (progress < 0) {
            wrapBackward(triggerRef.current);
        } else {
            triggerRef.current.scroll(triggerRef.current.start + progress * (triggerRef.current.end - triggerRef.current.start));
        }
    }




    useEffect(() => {
        gsap.set(cards.current, { xPercent: 400, opacity: 0, scale: 0 });


        function buildSeamlessLoop(items, spacing) {

            const animateFunc = element => {
                const tl = gsap.timeline();
                tl.fromTo(element, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false })
                    .fromTo(element, { xPercent: 400 }, { xPercent: -400, duration: 1, ease: "none", immediateRender: false }, 0);
                return tl;
            }

            let rawSequence = gsap.timeline({ paused: true }) // this is where all the "real" animations live
            let seamlessLoop = gsap.timeline({ // this merely scrubs the playhead of the rawSequence so that it appears to seamlessly loop
                paused: true,
                repeat: -1, // to accommodate infinite scrolling/looping
                onRepeat() { // works around a super rare edge case bug that's fixed GSAP 3.6.1
                    //this._time === this._dur && (this._tTime += this._dur - 0.01);
                },
                onReverseComplete() {
                    this.totalTime(this.rawTime() + this.duration() * 100); // seamless looping backwards
                }
            })
            let cycleDuration = spacing * items.length
            let dur // the duration of just one animateFunc() (we'll populate it in the .forEach() below...

            // loop through 3 times so we can have an extra cycle at the start and end - we'll scrub the playhead only on the 2nd cycle
            items.concat(items).concat(items).forEach((item, i) => {
                let anim = animateFunc(items[i % items.length]);
                rawSequence.add(anim, i * spacing);
                dur || (dur = anim.duration());
            });

            // animate the playhead linearly from the start of the 2nd cycle to its end (so we'll have one "extra" cycle at the beginning and end)
            seamlessLoop.fromTo(rawSequence, {
                time: cycleDuration + dur / 2
            }, {
                time: "+=" + cycleDuration,
                duration: cycleDuration,
                ease: "none"
            });
            console.log(seamlessLoop)
            return seamlessLoop;
        }

        // function buildSeamlessLoop(items, spacing) {
        // const animateFunc = element => {
        //     const tl = gsap.timeline();
        //     tl.fromTo(element, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false })
        //         .fromTo(element, { xPercent: 400 }, { xPercent: -400, duration: 1, ease: "none", immediateRender: false }, 0);
        //     return tl;
        // }
        //     let overlap = Math.ceil(1 / spacing), // number of EXTRA animations on either side of the start/end to accommodate the seamless looping
        //         startTime = items.length * spacing + 0.5, // the time on the rawSequence at which we'll start the seamless loop
        //         loopTime = (items.length + overlap) * spacing + 1, // the spot at the end where we loop back to the startTime
        //         rawSequence = gsap.timeline({ paused: true }), // this is where all the "real" animations live
        //         seamlessLoop = gsap.timeline({ // this merely scrubs the playhead of the rawSequence so that it appears to seamlessly loop
        //             paused: true,
        //             repeat: -1, // to accommodate infinite scrolling/looping
        //             onRepeat() { // works around a super rare edge case bug that's fixed GSAP 3.6.1
        //                 this._time === this._dur && (this._tTime += this._dur - 0.01);
        //             }
        //         }),
        //         l = items.length + overlap * 2,
        //         time, i, index;

        //     // now loop through and create all the animations in a staggered fashion. Remember, we must create EXTRA animations at the end to accommodate the seamless looping.
        //     for (i = 0; i < l; i++) {
        //         index = i % items.length;
        //         time = i * spacing;
        //         rawSequence.add(animateFunc(items[index]), time);
        //         i <= items.length && seamlessLoop.add("label" + i, time); // we don't really need these, but if you wanted to jump to key spots using labels, here ya go.
        //     }

        //     // here's where we set up the scrubbing of the playhead to make it appear seamless.
        //     rawSequence.time(startTime);
        //     seamlessLoop.to(rawSequence, {
        //         time: loopTime,
        //         duration: loopTime - startTime,
        //         ease: "none"
        //     }).fromTo(rawSequence, { time: overlap * spacing + 1 }, {
        //         time: startTime,
        //         duration: startTime - (overlap * spacing + 1),
        //         immediateRender: false,
        //         ease: "none"
        //     });
        //     return seamlessLoop;
        // }



        function scrollToOffset(offset) { // moves the scroll playhead to the place that corresponds to the totalTime value of the seamlessLoop, and wraps if necessary.
            const progressToScroll = progress => gsap.utils.clamp(1, triggerRef.current.end - 1, gsap.utils.wrap(0, 1, progress) * triggerRef.current.end)

            let snappedTime = snapTime(offset)
            let progress = (snappedTime - seamlessLoopRef.current.duration() * iteration) / seamlessLoopRef.current.duration()
            let scroll = progressToScroll(progress)
            if (progress >= 1 || progress < 0) {
                return wrap(Math.floor(progress), scroll);
            }
            triggerRef.current.scroll(scroll);
        }


        seamlessLoopRef.current = buildSeamlessLoop(cards.current, spacing)

        const wrapTime = gsap.utils.wrap(0, seamlessLoopRef.current.duration()) // feed in any offset (time) and it'll return the corresponding wrapped time (a safe value between 0 and the seamlessLoop's duration)

        scrubRef.current = gsap.to(playhead, { // we reuse this tween to smoothly scrub the playhead on the seamlessLoop
            totalTime: 0,
            offset: 0,
            onUpdate() {
                seamlessLoopRef.current.time(wrapTime(playhead.offset)); // convert the offset to a "safe" corresponding time on the seamlessLoop timeline
            },
            duration: 0.5,
            ease: "power3",
            paused: true,
        })

        // triggerRef.current = ScrollTrigger.create({
        //     start: 0,
        //     onUpdate(self) {
        //         let scroll = self.scroll();
        //         if (scroll > self.end - 1) {
        //             // wrap(1, 1);
        //             iteration += 1;
        //             triggerRef.current.scroll(1);
        //             triggerRef.current.update(); // by default, when we trigger.scroll(), it waits 1 tick to update().
        //         } else if (scroll < 1 && self.direction < 0) {
        //             // wrap(-1, self.end - 1);
        //             iteration += -1;
        //             triggerRef.current.scroll(self.end - 1);
        //             triggerRef.current.update(); // by default, when we trigger.scroll(), it waits 1 tick to update().
        //         } else {
        //             console.log(iteration, seamlessLoopRef.current.duration())
        //             scrubRef.current.vars.offset = (iteration + self.progress) * seamlessLoopRef.current.duration();
        //             scrubRef.current.invalidate().restart(); // to improve performance, we just invalidate and restart the same tween. No need for overwrites or creating a new tween on each update.
        //         }
        //     },
        //     end: "+=3000",
        //     pin: ".gallery"
        // })

        triggerRef.current = ScrollTrigger.create({
            start: 0,
            onUpdate(self) {
                if (self.progress === 1 && self.direction > 0 && !wrapping) {
                    console.log('forwards')
                    // wrapForward(self);
                    iteration++;
                    wrapping = true;
                    // self.scroll(self.start + 1);
                    //scrubRef.current.pause(0.5, false)
                    // seamlessLoopRef.current.progress(0.1, true)
                    // scrubRef.current.pause(0, true)
                    // scrubRef.current.paused(true)
                    self.disable()
                    self.scroll(self.start + 1)
                    self.enable()

                    // scrubRef.current.paused(false)
                    // scrubRef.current.restart()
                    return

                }

                if (self.progress < 1e-5 && self.direction < 0 && !wrapping) {
                    console.log('backwards')
                    //wrapBackward(self);
                    iteration += -1;
                    self.disable()
                    self.scroll(self.end - 2);
                    self.enable()
                    self.update()
                    self.refresh()

                    wrapping = true;
                    return

                    // if (iteration < 0) { // to keep the playhead from stopping at the beginning, we jump ahead 10 iterations
                    //     iteration = 9;
                    //     seamlessLoopRef.current.totalTime(seamlessLoopRef.current.totalTime() + seamlessLoopRef.current.duration() * 10);
                    //     scrubRef.current.pause(); // otherwise it may update the totalTime right before the trigger updates, making the starting value different than what we just set above. 
                    // }

                }

                // scrubRef.current.vars.totalTime = snapTime((iteration + self.progress) * seamlessLoopRef.current.duration());
                // scrubRef.current.vars.totalTime = (iteration + self.progress) * seamlessLoopRef.current.duration()
                scrubRef.current.vars.offset = (iteration + self.progress) * seamlessLoopRef.current.duration();
                // scrubRef.current.vars.offset = (iteration * seamlessLoopRef.current.duration()) + (seamlessLoopRef.current.duration() * self.progress);

                // console.log('seamlessLoopRef.current', seamlessLoopRef.current)
                // console.log('scrubRef.current', seamlessLoopRef.current.progress())
                // console.log('self', self)
                console.log(iteration, self.progress, scrubRef.current.vars.offset, seamlessLoopRef.current.duration())
                // console.log(iteration, self.progress, scrubRef.current.vars.totalTime, seamlessLoopRef.current.duration())
                // if (self.progress > 0.001 && self.progress <= 1) {
                //     console.log('iteration', iteration, wrapping, scrubRef.current.vars.offset, self.progress)
                //     scrubRef.current.vars.offset = (iteration * seamlessLoopRef.current.duration()) + self.progress;
                // }
                scrubRef.current.invalidate().restart();
                //if(self.progress)

                wrapping = false

                // if (wrapping) {
                //     clearTimeout(timeout)
                //     timeout = setTimeout(() => wrapping = false, 500)
                // }


            },
            end: "+=5000",
            pin: gallerRef.current
        });

        // converts a progress value (0-1, but could go outside those bounds when wrapping) into a "safe" scroll value that's at least 1 away from the start or end because we reserve those for sensing when the user scrolls ALL the way up or down, to wrap.

        // ScrollTrigger.addEventListener("scrollEnd", () => scrollToOffset(scrubRef.current.vars.offset));

        // Draggable.create(dragProxyRef.current, {
        //     type: "x",
        //     trigger: cards.current,
        //     onPress() {
        //         this.startOffset = scrubRef.current.vars.offset;
        //     },
        //     onDrag() {
        //         scrubRef.current.vars.offset = this.startOffset + (this.startX - this.x) * 0.001;
        //         scrubRef.current.invalidate().restart(); // same thing as we do in the ScrollTrigger's onUpdate
        //     },
        //     onDragEnd() {
        //         scrollToOffset(scrubRef.current.vars.offset);
        //     }
        // });


    }, []);



    return (
        <>
            <div className="gallery" ref={gallerRef}>
                <ul className="cards" ref={cardsContainerRef}>
                    <li ref={(e) => createCardsRefs(e, 0)} style={{ backgroundColor: stc("0") }}>0</li>
                    <li ref={(e) => createCardsRefs(e, 1)} style={{ backgroundColor: stc("1") }}>1</li>
                    <li ref={(e) => createCardsRefs(e, 2)} style={{ backgroundColor: stc("2") }}>2</li>
                    <li ref={(e) => createCardsRefs(e, 3)} style={{ backgroundColor: stc("3") }}>3</li>
                    <li ref={(e) => createCardsRefs(e, 4)} style={{ backgroundColor: stc("4") }}>4</li>
                    <li ref={(e) => createCardsRefs(e, 5)} style={{ backgroundColor: stc("5") }}>5</li>
                    <li ref={(e) => createCardsRefs(e, 6)} style={{ backgroundColor: stc("6") }}>6</li>
                    <li ref={(e) => createCardsRefs(e, 7)} style={{ backgroundColor: stc("7") }}>7</li>
                    <li ref={(e) => createCardsRefs(e, 8)} style={{ backgroundColor: stc("8") }}>8</li>
                    <li ref={(e) => createCardsRefs(e, 9)} style={{ backgroundColor: stc("9") }}>9</li>
                    <li ref={(e) => createCardsRefs(e, 10)} style={{ backgroundColor: stc("10") }}>10</li>
                    {/* <li ref={(e) => createCardsRefs(e, 11)} style={{ backgroundColor: stc("11") }}>11</li>
                    <li ref={(e) => createCardsRefs(e, 12)} style={{ backgroundColor: stc("12") }}>12</li>
                    <li ref={(e) => createCardsRefs(e, 13)} style={{ backgroundColor: stc("13") }}>13</li>
                    <li ref={(e) => createCardsRefs(e, 14)} style={{ backgroundColor: stc("14") }}>14</li>
                    <li ref={(e) => createCardsRefs(e, 15)} style={{ backgroundColor: stc("15") }}>15</li>
                    <li ref={(e) => createCardsRefs(e, 16)} style={{ backgroundColor: stc("16") }}>16</li>
                    <li ref={(e) => createCardsRefs(e, 17)} style={{ backgroundColor: stc("17") }}>17</li>
                    <li ref={(e) => createCardsRefs(e, 18)} style={{ backgroundColor: stc("18") }}>18</li>
                    <li ref={(e) => createCardsRefs(e, 19)} style={{ backgroundColor: stc("19") }}>19</li>
                    <li ref={(e) => createCardsRefs(e, 20)} style={{ backgroundColor: stc("20") }}>20</li>
                    <li ref={(e) => createCardsRefs(e, 21)} style={{ backgroundColor: stc("21") }}>21</li>
                    <li ref={(e) => createCardsRefs(e, 22)} style={{ backgroundColor: stc("22") }}>22</li>
                    <li ref={(e) => createCardsRefs(e, 23)} style={{ backgroundColor: stc("23") }}>23</li>
                    <li ref={(e) => createCardsRefs(e, 24)} style={{ backgroundColor: stc("24") }}>24</li>
                    <li ref={(e) => createCardsRefs(e, 25)} style={{ backgroundColor: stc("25") }}>25</li>
                    <li ref={(e) => createCardsRefs(e, 26)} style={{ backgroundColor: stc("26") }}>26</li>
                    <li ref={(e) => createCardsRefs(e, 27)} style={{ backgroundColor: stc("27") }}>27</li>
                    <li ref={(e) => createCardsRefs(e, 28)} style={{ backgroundColor: stc("28") }}>28</li>
                    <li ref={(e) => createCardsRefs(e, 29)} style={{ backgroundColor: stc("29") }}>29</li>
                    <li ref={(e) => createCardsRefs(e, 30)} style={{ backgroundColor: stc("30") }}>30</li> */}
                </ul>
                <div className="actions">
                    <button className="prev" onClick={() => scrubTo(scrubRef.current.vars.offset - spacing)}>Prev</button>
                    <button className="next" onClick={() => scrubTo(scrubRef.current.vars.offset + spacing)}>Next</button>
                </div>
            </div>
            <div className="drag-proxy" ref={dragProxyRef}></div>
        </>
    );
}
