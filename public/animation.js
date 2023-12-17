document.getElementById("year").innerHTML = new Date().getFullYear();



gsap.fromTo("body", { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.2 });