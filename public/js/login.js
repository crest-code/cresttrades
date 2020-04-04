let errorField;
let query = getQuery();


const validate = function() {
    
};

document.addEventListener("DOMContentLoaded", function () {
    let errImage = "<i class=\"icofont-close-circled\"></i>";
    errorField = document.querySelector('#error');

	if (query && query['idn'] && query['idn'] === "invalidid") {

        errorField.innerHTML = errImage + ' <div>Username/Password is incorrect!</div>';
        errorField.classList.toggle("serror", true);

    } else if (query.idn === "novalid"){

        errorField.innerHTML = errImage + ' <div>Username does not exist!</div>';
        errorField.classList.toggle("serror", true);
        
    }

    const tl = new TimelineMax();
    // tl.staggerFrom(document.querySelectorAll("#login-form > *"), 0.8, {x: "100vw", ease: Power1.easeOut, yoyo: true, repeat: 2}, 0.2);
    tl.staggerFrom(document.querySelectorAll("#login-form > *"), 0.8, {x: "100vw", ease: Power1.easeOut, stagger: 0.2});
    tl.add(
        TweenMax.from(document.querySelectorAll("#login-form+div"), 0.5, {opacity: 0, ease: Power1.easeOut})
    );
});