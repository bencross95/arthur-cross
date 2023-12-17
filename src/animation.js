document.getElementById("year").innerHTML = new Date().getFullYear();



// gsap.fromTo("body", { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.2 });


var tl = gsap.timeline();

tl.to(".projectItemList", {
    keyframes: {
      opacity: [0, 1],
    },
    duration: 0.5, // 0.1 seconds between when each ".box" element starts animating
  });