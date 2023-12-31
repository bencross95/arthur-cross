document.getElementById("year").innerHTML = new Date().getFullYear();

gsap.fromTo("body", { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.2 });

var tl = gsap.timeline();

tl.to(".projectItemList", {
  keyframes: {
    opacity: [0, 1],
  },
  duration: 0.8,
  stagger: 0.07, // 0.1 seconds between when each ".box" element starts animating
});




function openInfo() {
  var hiddenInfo = document.getElementById("hidden-info");
  if (hiddenInfo.style.display === "block") {
    hiddenInfo.style.display = "none";
    document.getElementById("info-button").innerHTML = "[info]";
  } else {
    hiddenInfo.style.display = "block";
    document.getElementById("info-button").innerHTML = "[close]";
  }
  console.log(hiddenInfo.style.display);
}


