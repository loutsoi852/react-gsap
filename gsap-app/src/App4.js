import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { useEffect, useRef } from "react";
import "./styles4.css";

gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(Draggable);

export default function App() {
    const panels = useRef([]);
    const panelsContainer = useRef();
    const scroll = useRef()
    const drag = useRef()
    const dragProxyRef = useRef();

    const createPanelsRefs = (panel, index) => {
        panels.current[index] = panel;
    };

    useEffect(() => {
        const totalPanels = panels.current.length;

        scroll.current = gsap.to(panels.current, {
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
                    //duration: { min: 0.2, max: 2 }, // the snap animation should be at least 0.2 seconds, but no more than 3 seconds (determined by velocity)
                    delay: 0, // wait 0.2 seconds from the last scroll event before doing the snapping
                    //ease: "none", // the ease of the snap animation ("power3" by default)
                },
                end: () => "+=4000",
                onUpdate(self) {
                    if (self.progress === 1 && self.direction > 0 && !self.rotating) {
                        self.rotating = true
                        self.scroll(self.start + 1);
                    } else if (self.progress < 1e-5 && self.direction < 0 && !self.rotating) {
                        self.rotating = true
                        self.scroll(self.end - 1);
                    } else {
                        self.rotating = false
                    }
                },
            }
        });


        drag.current = Draggable.create(dragProxyRef.current, {
            type: "x",
            trigger: panels.current,
            onPress() {
                this.startOffset = scroll.current.scrollTrigger.scroll();
            },
            onDrag() {
                let ST = scroll.current.scrollTrigger
                const dragDiff = this.startX - this.x

                console.clear('--------------')
                console.log(ST, 'ST')
                console.log(this, 'this')
                console.log(this.startOffset, 'this.startOffset')
                console.log(this.startX, 'this.startX')
                console.log(this.x, 'this.x')
                console.log(dragDiff, 'dragDiff')
                console.log(this.startOffset, 'this.startOffset')
                console.log(this.startOffset + dragDiff, 'this.startOffset + dragDiff)')
                //console.log(ST.progress, 'ST.progress')
                //console.log(ST.scroll(), 'ST.scroll()')
                //console.log(ST.progress, 'self.progress')
                console.log(ST.direction, 'ST.direction')
                console.log(this.getDirection(), 'this.getDirection()')

                if ((ST.progress < 1e-5 || ST.progress > 0.99) && this.getDirection() === 'left' && !ST.rotating) {
                    //console.log('rotate 1')
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
                //console.log('no rotate')


                ST.rotating = false
                ST.scroll(this.startOffset + dragDiff)

            },
            onDragEnd() {
            }
        });


    }, []);

    return (
        <div style={{ position: 'relative' }}>
            <div className="container" ref={panelsContainer}>
                <div className="description panel blue" ref={(e) => createPanelsRefs(e, 0)}>
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
                <div className="description panel blue" ref={(e) => createPanelsRefs(e, 5)} >
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
            <div className="drag-proxy" ref={dragProxyRef}></div>
        </div>
    );
}
