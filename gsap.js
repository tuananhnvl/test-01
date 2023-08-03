gsap.registerPlugin(ScrollTrigger);

// Using Locomotive Scroll from Locomotive https://github.com/locomotivemtl/locomotive-scroll

const locoScroll = new LocomotiveScroll({
  el: document.querySelector(".smooth-scroll"),
  smooth: true,
  lerp: 0.05
});
// each time Locomotive Scroll updates, tell ScrollTrigger to update too (sync positioning)
locoScroll.on("scroll", (event) => {
    const scrollY = event.scroll.y/1000;
    //console.log(scrollY)
    // Use ScrollTrigger.update to synchronize the scroll position
    ScrollTrigger.update();
  
    // Now you can use the scrollY value for any further logic or animations
  });
// tell ScrollTrigger to use these proxy methods for the ".smooth-scroll" element since Locomotive Scroll is hijacking things
ScrollTrigger.scrollerProxy(".smooth-scroll", {
  scrollTop(value) {
    return arguments.length ? locoScroll.scrollTo(value, 0, 0) : locoScroll.scroll.instance.scroll.y;
  }, // we don't have to define a scrollLeft because we're only scrolling vertically.
  getBoundingClientRect() {
    return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
  },
  // LocomotiveScroll handles things completely differently on mobile devices - it doesn't even transform the container at all! So to get the correct behavior and avoid jitters, we should pin things with position: fixed on mobile. We sense it by checking to see if there's a transform applied to the container (the LocomotiveScroll-controlled element).
  pinType: document.querySelector(".smooth-scroll").style.transform ? "transform" : "fixed"
});


// --- ORANGE PANEL ---
gsap.from(".line-2", {
  scrollTrigger: {
    trigger: ".orange",
    scroller: ".smooth-scroll",
    scrub: true,
    pin: ".orange",
    start: "top top",
    end: "+=300%",
    onUpdate: ({ progress }) => {
       localStorage.setItem('posY',progress)
    },
  },
/*   scaleX: 0, 
  transformOrigin: "left center", 
  ease: "none" */
});



// each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll. 
ScrollTrigger.addEventListener("refresh", () => locoScroll.update());

// after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
ScrollTrigger.refresh();