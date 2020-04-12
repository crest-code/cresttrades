let flagCountry = false;

document.addEventListener("DOMContentLoaded", function () {

    if (getCookie("ct-username")) {
        getUserData(getCookie("ct-username").value);
    }else{
        window.location.replace("/login");
    }
});

const getUserData = function(username){
    fetch(`/api/user/${username}`).then(async function(response) {
        try {
            let user_data = await response.json();
            if(user_data.uID === "" || user_data === undefined){
                window.location.replace("/login");
            }else{
                insertUserData(user_data);
            }
        } catch (err) {
            console.error(err);
        }
    }).catch(function(error) {
        console.error(error);
    });
};

const insertUserData = function(data) {

    const idDisplay = {
        firstname: document.querySelector("#user-fullname"),
        lastname: document.querySelector("#user-fullname"),
        address: document.querySelector("#user-address")
    };

    for (const key of Object.keys(data)) {

        if(data[key] !== "" && data[key] !== undefined){

            switch (key) {                
                case "firstname":
                    try{
                        idDisplay[key].innerHTML = data[key];
                    }catch(err){
                        console.error(err);
                    }
                    break;

                case "lastname":
                    try{
                        idDisplay[key].innerHTML = idDisplay[key].innerHTML + ` ${data[key]}`;
                    }catch(err){
                        console.error(err);
                    }
                    break;

                default:
                    try{
                        if(idDisplay.hasOwnProperty(key) === true){
                            idDisplay[key].innerHTML = data[key];
                        }
                    }catch(err){
                        console.error(err);
                    }
                    break;
            }
        }
    }
};

const createOption = function(container, displayText, value) {
    let option = createComponent("OPTION", displayText);
    option.setAttribute("value", value);
    container.appendChild(option);
};

const removeOption = function(option) {
    option.parentNode.removeChild(option);
};

const getCountries = function(evt) {
    // alert("getting countries");
    if(flagCountry === false){
        fetch(`/api/countries/all`).then(async function(response) {
            try {
                let country_list = await response.json();
                forEach(country_list, function(element) {
                    // debugger;
                    const nullChild = document.querySelector("[name='country'] option[value='null']");
                    if(nullChild){
                        nullChild.parentNode.removeChild(nullChild);
                    }
                    createOption(document.querySelector("[name='country']"), element.name, element.name);
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

            forEach(document.querySelectorAll("[name='state'] > option:not(:first-child)"), function(element) {
                removeOption(element);
            });

            if(regionList.length > 0){
                forEach(regionList, function(element) {

                    const nullChild = document.querySelector("[name='state'] option[value='null']");
                    if(nullChild){
                        nullChild.parentNode.removeChild(nullChild);
                    }
                    createOption(document.querySelector("[name='state']"), element.name, element.name);
                });
            }

        } catch (err) {
            console.error(err);
        }
    }).catch(function(error) {
        console.error(error);
    });
};

const updateHandler = function(evt) {
    evt.preventDefault();
    let template = {
        username: document.querySelector("[name='username']").value,
        firstname: document.querySelector("[name='firstname']").value,
        lastname: document.querySelector("[name='lastname']").value,
        phone: document.querySelector("[name='phone']").value,
        telcode: document.querySelector("[name='telcode'").value,
        state: document.querySelector("[name='state']").value,
        country: document.querySelector("[name='country']").value
    };

    fetch(`/myprofile/update`, {
        method: "post",
        body: JSON.stringify(template),
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }).then(async function(response) {
        try {
            let updateResult = await response.json();
            console.log(updateResult);
            alert("Save done");
        } catch (err) {
            console.error(err);
        }
    }).catch(function(error) {
        console.error(error);
    });
};