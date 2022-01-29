import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import "./styles3.css";
import stc from 'string-to-color'



gsap.registerPlugin(ScrollTrigger);
let iteration = 0; // gets iterated when we scroll all the way to the end or start and wraps around - allows us to smoothly continue the playhead scrubbing in the correct direction.

export default function App() {
    const cards = useRef([]);
    //const panelsContainer = useRef();
    const [length, setLength] = useState(0)
    const [wrapping, setWrapping] = useState(false)
    const [created, setCreated] = useState(false)


    const createCardsRefs = (panel, index) => {
        cards.current[index] = panel;
        setLength(cards.current.length)
    };


    const spacing = 0.1    // spacing of the cards (stagger)
    const snap = gsap.utils.snap(spacing) // we'll use this to snap the playhead on the seamlessLoop
    //const cards = gsap.utils.toArray('.cards li')
    const seamlessLoop = cards.current.length > 0 && buildSeamlessLoop(cards.current, spacing)
    const scrub = cards.current.length > 0 && gsap.to(seamlessLoop, { // we reuse this tween to smoothly scrub the playhead on the seamlessLoop
        totalTime: 0,
        duration: 0.5,
        ease: "power3",
        paused: true
    })
    const trigger = cards.current.length > 0 && ScrollTrigger.create({
        start: 0,
        onUpdate(self) {
            console.log('self.direction', self.direction)
            if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
                console.log('wrap forwards')
                wrapForward(self);
            } else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
                console.log('wrap backwards')

                wrapBackward(self);
            } else {
                //scrub.vars.totalTime = snap((iteration + self.progress) * seamlessLoop.duration());
                scrub.vars.totalTime = (iteration + self.progress) * seamlessLoop.duration()
                scrub.invalidate().restart(); // to improve performance, we just invalidate and restart the same tween. No need for overwrites or creating a new tween on each update.
                self.wrapping = false;
            }
        },
        end: "+=8000",
        pin: ".gallery"
    });

    !created && cards.current.length > 0 && console.log('adsfjklhsdkjfh')
    !created && cards.current.length > 0 && setCreated(true)

    if (seamlessLoop) {
        console.log('seamlessLoop.totalDuration()', seamlessLoop.totalDuration())
    }


    function wrapForward(trigger) { // when the ScrollTrigger reaches the end, loop back to the beginning seamlessly
        iteration++;
        trigger.wrapping = true;
        trigger.scroll(trigger.start + 1);
    }

    function wrapBackward(trigger) { // when the ScrollTrigger reaches the start again (in reverse), loop back to the end seamlessly
        iteration--;
        if (iteration < 0) { // to keep the playhead from stopping at the beginning, we jump ahead 10 iterations
            iteration = 9;
            seamlessLoop.totalTime(seamlessLoop.totalTime() + seamlessLoop.duration() * 10);
            scrub.pause(); // otherwise it may update the totalTime right before the trigger updates, making the starting value different than what we just set above. 
        }
        trigger.wrapping = true;
        trigger.scroll(trigger.end - 1);
    }

    function scrubTo(totalTime) { // moves the scroll position to the place that corresponds to the totalTime value of the seamlessLoop, and wraps if necessary.
        let progress = (totalTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration();
        if (progress > 1) {
            wrapForward(trigger);
        } else if (progress < 0) {
            wrapBackward(trigger);
        } else {
            trigger.scroll(trigger.start + progress * (trigger.end - trigger.start));
        }
    }



    function buildSeamlessLoop(items, spacing) {
        let overlap = Math.ceil(1 / spacing) // number of EXTRA animations on either side of the start/end to accommodate the seamless looping
        let startTime = items.length * spacing + 0.5 // the time on the rawSequence at which we'll start the seamless loop
        let loopTime = (items.length + overlap) * spacing + 1 // the spot at the end where we loop back to the startTime 
        let rawSequence = gsap.timeline({ paused: true }) // this is where all the "real" animations live
        let seamlessLoop = gsap.timeline({ // this merely scrubs the playhead of the rawSequence so that it appears to seamlessly loop
            paused: true,
            repeat: -1, // to accommodate infinite scrolling/looping
            onRepeat() { // works around a super rare edge case bug that's fixed GSAP 3.6.1
                this._time === this._dur && (this._tTime += this._dur - 0.01);
            }
        })
        let l = items.length + overlap * 2
        let time = 0
        let i, index, item;

        // set initial state of items
        gsap.set(items, { xPercent: 400, opacity: 0, scale: 0 });

        // now loop through and create all the animations in a staggered fashion. Remember, we must create EXTRA animations at the end to accommodate the seamless looping.
        for (i = 0; i < l; i++) {
            index = i % items.length;
            item = items[index];
            time = i * spacing;
            rawSequence.fromTo(item,
                {
                    scale: 1,
                    opacity: 0
                },
                {
                    scale: 1,
                    opacity: 1,
                    zIndex: 100,
                    duration: 0.5,
                    yoyo: true,
                    repeat: 1,
                    ease: "power1.in",
                    immediateRender: false
                }, time)
                .fromTo(item,
                    {
                        xPercent: 395
                    },
                    {
                        xPercent: -395,
                        duration: 1,
                        ease: "none",
                        immediateRender: false
                    }, time
                );
            //i <= items.length && seamlessLoop.add("label" + i, time); // we don't really need these, but if you wanted to jump to key spots using labels, here ya go.
        }

        // here's where we set up the scrubbing of the playhead to make it appear seamless. 
        rawSequence.time(startTime);
        seamlessLoop.to(rawSequence, {
            time: loopTime,
            duration: loopTime - startTime,
            ease: "none"
        }).fromTo(rawSequence, { time: overlap * spacing + 1 }, {
            time: startTime,
            duration: startTime - (overlap * spacing + 1),
            immediateRender: false,
            ease: "none"
        });
        return seamlessLoop;
    }


    return (
        <>
            <div className="gallery">
                <ul className="cards">
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
                    <li ref={(e) => createCardsRefs(e, 11)} style={{ backgroundColor: stc("11") }}>11</li>
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
                    <li ref={(e) => createCardsRefs(e, 30)} style={{ backgroundColor: stc("30") }}>30</li>
                </ul>
                <div className="actions">
                    <button className="prev" onClick={() => scrubTo(scrub.vars.totalTime - spacing)}>Prev</button>
                    <button className="next" onClick={() => scrubTo(scrub.vars.totalTime + spacing)}>Next</button>
                </div>
            </div>
        </>
    );
}
