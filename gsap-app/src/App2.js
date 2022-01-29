import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import "./styles2.css";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
    const panels = useRef([]);
    const panelsContainer = useRef();
    const to = useRef()

    const createPanelsRefs = (panel, index) => {
        panels.current[index] = panel;
    };

    useEffect(() => {
        const totalPanels = panels.current.length;

        to.current = gsap.to(panels.current, {
            xPercent: -100 * (totalPanels - 1),
            ease: "none",
            paused: true,
            scrollTrigger: {
                trigger: panelsContainer.current,
                pin: true,
                scrub: true,
                start: 0,
                snap: {
                    snapTo: 1 / (totalPanels - 1),//"labels", // snap to the closest label in the timeline
                    duration: { min: 0.2, max: 2 }, // the snap animation should be at least 0.2 seconds, but no more than 3 seconds (determined by velocity)
                    delay: 0.5, // wait 0.2 seconds from the last scroll event before doing the snapping
                    ease: "none", // the ease of the snap animation ("power3" by default)
                },
                // base vertical scrolling on how wide the container is so it feels more natural.
                end: () => "+=4000",
                onUpdate(self) {
                    if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
                        // self.vars.scrub = true;
                        self.wrapping = true
                        to.current.pause()
                        self.scroll(self.start + 1);
                    } else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
                        // self.vars.scrub = true;
                        self.wrapping = true
                        to.current.pause()
                        self.scroll(self.end - 1);
                    } else {
                        // self.vars.scrub = 0.2;
                        self.wrapping = false

                    }

                    console.log('self.progress', self.progress)
                    console.log('self.vars', self.vars)
                    console.log('to.current', to.current)
                }
            }
        });
    }, []);

    return (
        <>
            <div className="container" ref={panelsContainer}>
                <div
                    className="description panel blue"
                    ref={(e) => createPanelsRefs(e, 0)}
                >
                    <div>
                        <h1>Horizontal snapping sections (simple)</h1>
                        <p>
                            Scroll vertically to scrub the horizontal animation. It also
                            dynamically snaps to the sections in an organic way based on the
                            velocity. The snapping occurs based on the natural ending position
                            after momentum is applied, not a simplistic "wherever it is when
                            the user stops".
                        </p>
                        <div className="scroll-down">
                            Scroll down<div className="arrow"></div>
                        </div>
                    </div>
                </div>
                <section className="panel red" ref={(e) => createPanelsRefs(e, 1)}>
                    ONE
                </section>
                <section className="panel orange" ref={(e) => createPanelsRefs(e, 2)}>
                    TWO
                </section>
                <section className="panel purple" ref={(e) => createPanelsRefs(e, 3)}>
                    THREE
                </section>
                <section className="panel green" ref={(e) => createPanelsRefs(e, 4)}>
                    FOUR
                </section>
                <div
                    className="description panel blue"
                    ref={(e) => createPanelsRefs(e, 5)}
                >
                    <div>
                        <h1>Horizontal snapping sections (simple)</h1>
                        <p>
                            Scroll vertically to scrub the horizontal animation. It also
                            dynamically snaps to the sections in an organic way based on the
                            velocity. The snapping occurs based on the natural ending position
                            after momentum is applied, not a simplistic "wherever it is when
                            the user stops".
                        </p>
                        <div className="scroll-down">
                            Scroll down<div className="arrow"></div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
}
