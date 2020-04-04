// const socket = io();


let images = ["0a9c147c668744d0afcb9d320afa0b73.jpg"];
let slides = null;
let counter = 0;
const scrollSpeed = 2.5;
const pauseTime = 7;

const scrollAnimation = function() {
    gsap.set(slides[counter], {opacity: 1});
    gsap.to(slides[counter], scrollSpeed, {
        x: 0,
        delay: pauseTime,
        onStart: nextImage
    });
};

const nextImage = function(){
    gsap.to(slides, scrollSpeed, {x: "-100%", ease: "Power4.easeIn", onStart: function(){
        counter = (counter === slides.length - 1)? 0 : counter + 1;
        gsap.fromTo(slides[counter], scrollSpeed, {x: "100%", opacity: 1}, {x: 0, onComplete: scrollAnimation});
    }});
};

const prevImage = function(){
    counter = (counter === 0)? images.length-1 : counter - 1;
};

document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll(".testimonial-pane .testimony-container > *");
    const tl = gsap.timeline();
    slides = document.querySelectorAll(".banner .container .pane");

    gsap.set(slides, {opacity: 0});
    const sr = ScrollReveal();


    sr.reveal('.intro-pane');
    sr.reveal('.benefit-pane', {delay: 200});
    sr.reveal('.widget-container');
    sr.reveal('.plans-pane');
    sr.reveal('.stats-pane');

    appear({
        init: function(){
            tl.add(
                gsap.set(elements, {rotationX: 89.5})
            );
        },
        elements: (function() {
            return [document.querySelector(".testimonial-pane .testimony-container"), document.querySelector(".stats-pane .stat-container")];
        }()),
        appear: function(el){    
            if(el === document.querySelector(".testimonial-pane .testimony-container")){
                tl.add(
                    gsap.to(elements, 0.9, {rotationX: 0, stagger: 0.5, ease: "elastic.in(1, 0.8)"}) //, paused: true
                );
            }

            if(el === document.querySelector(".stats-pane .stat-container")){
                let done = null, count0 = 0, count1 = 0, count2 = 0, elems = document.querySelectorAll(".stats-pane .stat-container .num");
                let tick1 = setInterval(()=>{
    
                    if(count0 < 7050){
                        elems[0].innerHTML = `${count0}`;
                    }else{
                        clearInterval(tick1);
                        elems[0].innerHTML = `7, 000`;
                    }

                    count0 += 50;
                }, 1);

                let tick2 = setInterval(()=>{
    
                    if(count1 <= 354000){
                        elems[1].innerHTML = `$${count1}`;
                    }else{
                        clearInterval(tick2);
                        elems[1].innerHTML = `$354,000.15`;
                    }

                    count1 += 1000;
                }, 1);

                let tick3 = setInterval(()=>{
    
                    if(count2 <= 243){
                        elems[2].innerHTML = `${count2}`;
                    }else{
                        clearInterval(tick3);
                    }

                    count2 += 1;
                }, 1);
            }
        }
    });


    scrollAnimation();
});