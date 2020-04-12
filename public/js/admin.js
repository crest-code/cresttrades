let newContainer = null;
let allContainer = null;
const globals = {};

const createNoUserTag = function(container, tag) {
    container = container || document.querySelector("#all-container");
    tag = tag || "No user has registered yet. All your registered users would appear here.";

    let div0 = createComponent("DIV", tag, ["rows", "trans-container"]);
    div0.id = "no-users";
    container.appendChild(div0);
};

const createUser = function(container, data) {
    
    let regDate = (new Date(parseInt(data.reg_date))).toUTCString();
    let d = new Date();
    console.log(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
    // <div class="rows user">
    //     <span><input type="checkbox" id=""></span>
    //     <span class="lg-25">Temiloluwa Ogunbanjo</span>
    //     <span class="lg-25">tehmi2000@gmail.com</span>
    //     <span class="lg-15">tehmi2000</span>
    //     <span class="lg-15">Starter</span>
    //     <span class="lg-15"></span>
    // </div>
    // console.log(new Date(1578182000000).toUTCString());
    let div0 = createComponent("DIV", null, ["rows", "user", `${data.uID}`]);
        let span1 = createComponent("span");
        let span2 = createComponent("span", `${data.fullname}`, ["lg-25"]);
        let span3 = createComponent("span", `${data.email}`, ["lg-25"]);
        let span4 = createComponent("span", `${data.username}`, ["lg-15"]);
        let span5 = createComponent("span", `${data.account_plan}`, ["lg-10"]);
        let span6 = createComponent("span", `${regDate}`, ["lg-20"]);

    div0.setAttribute("data-id", data.uID);
    span1.innerHTML = `<input type="checkbox" class="check_${data.uID}">`;
    div0.addEventListener("click", function(evt) {
        let chkboxes = document.querySelectorAll(`.check_${evt.currentTarget.getAttribute("data-id")}`);
        chkboxes.forEach(chkbox => {
            if(chkbox.getAttribute("checked")){
                chkbox.removeAttribute("checked");
            }else{
                chkbox.setAttribute("checked", true);
            }
        });
    });
    div0 = joinComponent(div0, span1, span2, span3, span4, span5, span6);
    container.appendChild(div0);
};

const addHandlers = function() {
    const SIButton = document.querySelector("#SI-control");
    const CAButton = document.querySelector("#CA-control");

    SIButton.addEventListener("click", evt=>{document.querySelector(".main-body #admin-login-form #admin-username-1").focus()});
    CAButton.addEventListener("click", evt=>{document.querySelector(".main-body #admin-create-form #admin-username-2").focus()});

};

document.addEventListener("DOMContentLoaded", function() {
    newContainer = document.querySelector("#new-container");
    allContainer = document.querySelector("#all-container");

    const apiUrl = '/api/allres';
    if(getCookie("CTA-admin-ucode")){
        // Fetch User data
    }

    fetch(apiUrl).then(async response => {
        try {
            let result = await response.json();
            newContainer.innerHTML = "";
            allContainer.innerHTML = "";

            if(result.length > 0){
                let todayStart = Date.now() - (((new Date().getHours() - 1) * 3600000) + (new Date().getMinutes() * 60000) + (new Date().getSeconds() * 1000) + new Date().getMilliseconds());
                let newUsers = result.filter(item => {
                    return parseInt(item.reg_date) > todayStart;
                });

                if(newUsers.length > 0){
                    newUsers.forEach(user => {
                        createUser(newContainer, user);
                    });
                }else{
                    createNoUserTag(newContainer);
                }

                result.forEach(user => {
                    createUser(allContainer, user);
                });

                globals.newUsers = newUsers;
                globals.allUsers = result;
                console.log(globals);
            }else{
                createNoUserTag(allContainer);
            }
            
        } catch (error) {
            console.log(error);
        }
    }).catch(error => {
        console.error(error);
    });

    addHandlers();

    // createUser(allContainer, {
    //     uID: "SJNJSANNASNQAJAA",
    //     fullname: "Temiloluwa Ogunbanjo",
    //     email: "tehmi2000@gmail.com",
    //     username: "Tehmi2000",
    //     account_plan: "Platinum",
    //     reg_date: "00:00:00:10 31st July, 2019"
    // });
});