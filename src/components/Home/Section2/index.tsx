"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "../styles.module.scss";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Section2() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftImgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const rightImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    const ctx = gsap.context(() => {
      if (isMobile) {
        // Mobile: Simple fade up (no horizontal movement)
        gsap.set([leftImgRef.current, titleRef.current, textRef.current, rightImgRef.current], {
          opacity: 0,
          y: 40,
        });

        gsap.to([leftImgRef.current, titleRef.current, textRef.current, rightImgRef.current], {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        });
      } else {
        // Desktop: Slow scroll-controlled animations with scrub
        // Desktop: Slow scroll-controlled animations (premium feel)
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: sectionRef.current,
    start: "top 75%",
    end: "+=900",     // LONG scroll distance = slower motion
    scrub: 1.5,       // Smooth dragging
  },
});

// INITIAL STATES (bigger offsets = slower visible motion)
gsap.set(leftImgRef.current, {
  opacity: 0,
  x: -200,
});

gsap.set(titleRef.current, {
  opacity: 0,
  y: 120,
});

gsap.set(textRef.current, {
  opacity: 0,
  x: -160,
});

gsap.set(rightImgRef.current, {
  opacity: 0,
  x: 200,
});

// TIMELINE (no duration, scroll controls speed)
tl.to(leftImgRef.current, {
  opacity: 1,
  x: 0,
  ease: "none",
})
.to(titleRef.current, {
  opacity: 1,
  y: 0,
  ease: "none",
}, "<0.1")
.to(textRef.current, {
  opacity: 1,
  x: 0,
  ease: "none",
}, "<0.1")
.to(rightImgRef.current, {
  opacity: 1,
  x: 0,
  ease: "none",
}, "<0.1");

      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles["section-2"]}>
      <div className={styles["tax-account"]}>
        <div ref={leftImgRef} className={styles["left-img"]}>
          <img src="./images/home/tax-account.png" alt="" />
        </div>
        <h1 ref={titleRef}>
          Tax Accounting <br />
          Together
        </h1>
      </div>

      <div className="container">
        <div className={styles["tax-account-text"]}>
          <h3 ref={textRef}>
            {" "}
            고객이<span> 믿고 맡길 수 있는 세무 파트너,</span> <br /> 그 신뢰가 곧 우리가 지향하는 <br />{" "}
            '세무법인 함께'의 가치입니다.
          </h3>
          <div ref={rightImgRef} className={styles["right-img"]}>
            <img src="./images/home/tax-account2.png" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}
