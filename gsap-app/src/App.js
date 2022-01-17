
import { useState, useEffect, useRef, forwardRef, useLayoutEffect, useImperativeHandle } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import './App.css'


function App() {

  return (
    <div className="app" style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* <Component1 /> */}
      {/* <Component2 /> */}
      {/* <Component3 /> */}
      {/* <Component4 /> */}
      {/* <Component5 /> */}
      {/* <Component6 /> */}
      {/* <Component7 /> */}
      {/* <Component8 /> */}
      <Component9 />
      {/* <Component10 /> */}
    </div>
  );
}

export default App;

function Box({ children }) {
  return <div className='box'>{children}</div>;
}

const BoxRef = forwardRef(({ children }, ref) => {
  return <div className='box' ref={ref}>{children}</div>;
});

function Circle({ children }) {
  return <div className='circle'>{children}</div>;
}

function Component1() {
  const el = useRef();
  const q = gsap.utils.selector(el);
  useEffect(() => {
    gsap.to(q(".box"), {
      x: 200,
      stagger: 0.5,
      repeat: -1,
      repeatDelay: 2,
      yoyo: true
    });
  });

  return (
    <div ref={el} className="app">
      <Box>Hello</Box>
      <Box>Hello</Box>
      <Box>Hello</Box>
    </div>
  );
}


function Component2() {
  const boxRef1 = useRef();
  const boxRef2 = useRef();
  const el = useRef();

  useEffect(() => {
    const boxes = [boxRef1.current, boxRef2.current]
    gsap.to(boxes, {
      x: 200,
      stagger: 0.5,
      repeat: -1,
      repeatDelay: 2,
      yoyo: true
    });
  });

  return (
    <div ref={el} className="app">
      <BoxRef ref={boxRef1}>Hello</BoxRef>
      <Box>Hello</Box>
      <BoxRef ref={boxRef2}>Hello</BoxRef>
    </div>
  );
}

function Component3() {
  const [reversed, setReversed] = useState(false);
  const el = useRef();
  const q = gsap.utils.selector(el);

  // store the timeline in a ref.
  const tl = useRef();

  useEffect(() => {
    // add a box and circle animation to our timeline and play on first render
    tl.current = gsap.timeline()
      .to(q(".box"), {
        rotate: 360
      })
      .to(q(".circle"), {
        x: 100
      }).to(q(".box"), {
        rotate: -360
      })

  }, [])

  useEffect(() => {
    // toggle the direction of our timeline
    tl.current.reversed(reversed);
  }, [reversed]);

  return (
    <div className="app" ref={el}>
      <div>
        <button onClick={() => setReversed(!reversed)}>Toggle</button>
      </div>
      <Box>box</Box>
      <Circle>circle</Circle>
    </div>
  );
}

function Component4() {
  const el = useRef();
  const q = gsap.utils.selector(el);

  const [count, setCount] = useState(0);
  const [delayedCount, setDelayedCount] = useState(0);

  // only runs on first render
  useEffect(() => {
    gsap.to(q(".box-1"), { rotation: "+=360" });
  }, []);

  // runs on first render and every time delayedCount changes
  useEffect(() => {
    gsap.to(q(".box-2"), { rotation: "+=360" });
  }, [delayedCount]);

  // runs on every render
  useEffect(() => {
    gsap.to(q(".box-3"), { rotation: "+=360" });
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedCount(count);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count]);

  return (
    <div className="app" ref={el}>
      <div>
        <button onClick={() => setCount(count + 1)}>Click to trigger a render</button>
      </div>
      <p>Count: {count}</p>
      <p>Delayed Count: {delayedCount}</p>
      <p>Renders: {1 + delayedCount + count}</p>
      <div className="flex-row">
        <div className="box box-1 purple">First render</div>
        <div className="box box-2 blue">First render & delayed count change</div>
        <div className="box box-3 red">Every render</div>
      </div>
    </div>
  );
}

function Box5({ children, endX }) {
  const boxRef = useRef();
  // run when `endX` changes
  useEffect(() => {
    gsap.to(boxRef.current, {
      x: endX
    });
  }, [endX]);

  return <div className="box" ref={boxRef}>{children}</div>;
}

function Component5() {
  const randomX = gsap.utils.random(-200, 200, 1, true);
  const [endX, setEndX] = useState(0);

  return (
    <div className="app">
      <button onClick={() => setEndX(randomX())}>Pass in a randomized value</button>
      <Box5 endX={endX}>{endX}</Box5>
    </div>
  );
}

function Component6() {
  const onEnter = (e) => {
    gsap.to(e.currentTarget, { backgroundColor: "#e77614", scale: 1.2 });
  };

  const onLeave = ({ currentTarget }) => {
    gsap.to(currentTarget, { backgroundColor: "#28a92b", scale: 1 });
  };

  return (
    <div className="app flex-row">
      <div className="box" onMouseEnter={e => onEnter(e)} onMouseLeave={onLeave}>
        Hover Me
      </div>
    </div>
  );
}

function fetchFakeData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 1, color: "blue" },
        { id: 2, color: "red" },
        { id: 3, color: "purple" },
      ]);
    }, 2000);
  });
}

function BoxC({ children, color }) {
  return (
    <div className={`box ${color}`}>{children}</div>
  );
}

function Component7() {
  const el = useRef();
  const q = gsap.utils.selector(el);
  const [data, setData] = useState([]);
  const [loadingState, setLoadingState] = useState();

  useEffect(() => {
    if (loadingState !== "start") return;

    const loadData = async () => {
      const data = await fetchFakeData();
      setData(data);
      setLoadingState("complete");
    }
    loadData();

  }, [loadingState]);

  useLayoutEffect(() => {
    if (loadingState !== "complete") return;

    gsap.fromTo(q(".box"), {
      opacity: 0
    }, {
      opacity: 1,
      duration: 1,
      stagger: 0.2
    });
  }, [loadingState]);

  const startLoading = () => {
    if (!loadingState) {
      setLoadingState("start");
    }
  };

  return (
    <div className="panel flex-row" ref={el}>
      {!loadingState && <div><button onClick={startLoading}>Start Loading</button></div>}
      {loadingState === "start" && <div className="loading">Loading fake data...</div>}
      {data.map(item => <BoxC key={item.id} {...item}>Box {item.id}</BoxC>)}
    </div>
  );

}

const Circle8 = forwardRef(({ size, delay }, ref) => {
  const el = useRef();

  useImperativeHandle(ref, () => {
    return {
      moveTo(x, y) {
        gsap.to(el.current, { x, y, delay });
      }
    };
  }, [delay]);

  return <div className={`circle8 ${size}`} ref={el}></div>;
});

function Component8() {
  const circleRefs = useRef([]);

  circleRefs.current = [];

  useEffect(() => {
    const onMove = ({ clientX, clientY }) => {
      circleRefs.current.forEach(ref => ref.moveTo(clientX, clientY));
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const addCircleRef = ref => {
    if (ref) {
      console.log('ref', ref)
      circleRefs.current.push(ref);
    }
  };

  return (
    <div className="app">
      <p>Move your mouse around</p>
      <Circle8 size="sm" ref={addCircleRef} delay={0} />
      <Circle8 size="md" ref={addCircleRef} delay={0.1} />
      <Circle8 size="lg" ref={addCircleRef} delay={0.2} />
    </div>
  );
}

gsap.registerPlugin(CustomEase);
gsap.config({ trialWarn: false });

// CustomWiggle.create("myWiggle", {
//   wiggles: 8,
//   type: "uniform"
// });

gsap.registerEffect({
  name: "pulse",
  effect(targets) {
    return gsap.fromTo(targets, {
      scale: 1
    }, {
      scale: 1.5,
      repeat: 1,
      ease: "bounce",
      yoyoEase: "power3"
    });
  }
});

gsap.registerEffect({
  name: "spin",
  effect(targets) {
    return gsap.to(targets, {
      rotation: (i, el) => gsap.utils.snap(360, gsap.getProperty(el, "rotation") + 360)
    });
  }
});

gsap.registerEffect({
  name: "shake",
  effect(targets) {
    return gsap.fromTo(targets, {
      x: 0
    }, {
      x: 10,
      ease: "myWiggle"
    });
  }
});

const GsapEffect = forwardRef(({ children, effect, targetRef, vars }, ref) => {
  const animation = useRef();

  useLayoutEffect(() => {

    if (gsap.effects[effect]) {
      animation.current = gsap.effects[effect](targetRef.current, vars);
    }
  }, [effect]);

  useEffect(() => {

    // forward the animation instance if a ref is passed
    if (typeof ref === "function") {
      ref(animation.current);
    } else if (ref) {
      ref.current = animation.current;
    }
  }, [ref]);

  return <>{children}</>;
});

const wrap = gsap.utils.wrap(["pulse", "spin", "shake"]);


const Box9 = forwardRef(({ children }, ref) => {
  return <div className="box9" ref={ref}>{children}</div>;
});


function Component9() {
  const boxRef = useRef();
  const count = useRef(0);
  const [effect, setEffect] = useState("");

  const toggle = () => {
    setEffect(wrap(count.current++));
  };

  return (
    <div className="app">
      <div>
        <button onClick={toggle}>Toggle</button>
      </div>
      <p>Effect: {effect}</p>
      <GsapEffect targetRef={boxRef} effect={effect}>
        <Box9 ref={boxRef}>Box</Box9>
      </GsapEffect>
    </div>
  );
}