let flagCountry = false;

const createOption = function(container, displayText, value) {
    let option = createComponent("OPTION", displayText);
    option.setAttribute("value", value);
    container.appendChild(option);
};

const removeOption = function(option) {
    option.parentNode.removeChild(option);
};

const getCountries = function(evt) {
    if(flagCountry === false){
        fetch(`/api/countries/all`).then(async function(response) {
            try {
                let country_list = await response.json();
                forEach(country_list, function(element) {
                    createOption(document.querySelector("[name='user-country']"), element.name, element.name);
                });
                flagCountry = true;
    
            } catch (err) {
                console.error(err);
            }
        }).catch(function(error) {
            console.error(error);
        });
    }
};

const getRegion = function(evt) {
    fetch(`/api/countries/all/${evt.currentTarget.value}/getRegions`).then(async function(response) {
        try {
            let regionList = await response.json();
            forEach(document.querySelectorAll("[name='user-region'] > option:not(:first-child)"), function(element) {
                removeOption(element);
            });

            if(regionList.length > 0){
                forEach(regionList, function(element) {
                    createOption(document.querySelector("[name='user-region']"), element.name, element.name);
                });
            }

        } catch (err) {
            console.error(err);
        }
    }).catch(function(error) {
        console.error(error);
    });
};

const matchPasswords = function(evt) {
    // debugger
    const passwordField = document.querySelector("#user-password");
    if(evt.currentTarget.value === passwordField.value){
        evt.currentTarget.style.borderBottom = "2px solid #02b102";
    }else{
        evt.currentTarget.style.borderBottom = "2px solid red";
    }
};

const checkForQuery = function(){
    let queryParams = getQuery();

    if(queryParams){
        if(queryParams.error) {
            const errorD = document.querySelector("form .error");
            errorD.classList.toggle("serror", true);
    
            switch(queryParams.idn){
                case "userexist":
                    errorD.innerHTML = "<i class='icofont-exclamation-circle'></i>&nbsp;A user exist with that username/email!";
                    break;
    
                default:
                    errorD.innerHTML = "An error occurred!";
                    break;
            }
        }
        
        if(queryParams.startUp_plan){
            const selectOption = document.querySelector(`#sign-up-form select[name='account-plan'] option[value='${queryParams.startUp_plan}']`);            
            selectOption.setAttribute("selected", true);
        }
    }
	
};

const checkAgreement = function(evt){
    // e
    console.log(evt.currentTarget.checked);
    if(evt.currentTarget.checked === true){
        document.querySelector("input[type='submit']").removeAttribute("disabled");
    }else{
        document.querySelector("input[type='submit']").setAttribute("disabled", true);
    }
}

const startAnimation = function(tl) {
    const a = function() {
        const element = document.querySelector(".form-wrapper [data-anim-container] h1:first-child");

        return gsap.from(element, 1, {
            opacity: 0,
            top: "0%",
            left: "unset",
            onComplete: function() {
                gsap.to(element, 0.6, {opacity: 0, left: "0%", delay: 1.2, ease: Power2.easeIn});
            }
        });
    };

    const b = function() {
        const element = document.querySelector(".form-wrapper [data-anim-container] h1:nth-child(2)");
        return gsap.from(element, 1, {
            opacity: 0,
            top: "unset",
            position: "absolute",
            delay: 2,
            onComplete: function() {
                gsap.to(element, 0.6, {
                    top: "3%",
                    delay: 1,
                    onComplete: function() {
                        gsap.to(element, 0.6, {opacity: 0});
                    }
                });
            }
        });
    };

    const c = function() {
        const ctl = gsap.timeline();
        const element = document.querySelectorAll(".form-wrapper .pane-container > *");

        ctl.add(gsap.from(element, 0.6, {
                opacity: 0,
                width: "120%",
                x: "-50%",
                delay: 2,
                stagger: 2,
                ease: Power3.easeOut
            }))
            .add(gsap.to(element, 0.6, {
                opacity: 0,
                rotation: "-90deg",
                x: "-50%",
                delay: 1,
                stagger: 0.8,
                ease: Power3.easeIn
            }));
        return ctl;
    };

    const d = function() {
        const element = document.querySelector(".form-wrapper [data-anim-container] h1:nth-child(2)");
        return gsap.to(element, 0.6, {opacity: 0, delay: 1.2, ease: Power2.easeIn});
    };

    const e = function() {
        const element = document.querySelector(".form-wrapper [data-anim-container] h1:nth-child(3)");
        return gsap.fromTo(element, 1, {opacity: 0, fontSize: "2rem"}, {opacity: 1,fontSize: "2.6rem", ease: Power2.easeIn});
    };
  
    tl.add(gsap.set(document.querySelectorAll("main .form-wrapper > div:first-child > *"), {opacity: 1}))
    .add(a())
    .add(b())
    .add(c())
    .add(d())
    .add(e());

    return tl;
};

const nextPage = function(pgNumber) {
    const formNo = (Math.abs(pgNumber) === 0)? 1 : Math.abs(pgNumber);
    document.querySelector(`#sign-up-form .form-pane:nth-child(${formNo})`).style.marginLeft = `${(pgNumber/ Math.abs(pgNumber)) * 100}%`;
};

document.addEventListener("DOMContentLoaded", function() {
    const tl = gsap.timeline({repeat: 2, repeatDelay: 10, onRepeat: function() {
        this.restart();
    }});

    document.querySelector("#confirm-password").addEventListener("input", matchPasswords);
    document.querySelector("[name='user-country']").addEventListener("click", getCountries);
    document.querySelector("[name='user-country']").addEventListener("change", getRegion);
    // document.querySelector("#agreement").addEventListener("change", checkAgreement);
    checkForQuery();
    startAnimation(tl);

});