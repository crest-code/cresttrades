const model = function() {
    const fs = require("fs");
    const ph = require("./passwordHash");
    const mysql_config =  require("./config");
    const { emailSender } = require("./emailHandler");
    
    const { log } = mysql_config;

    const readFile = function(path, req, res) {
        fs.readFile(path, "utf8", function(err, content) {
            if (err) {
                throw err;
            } else {
                res.setHeader('Content-Type', 'text/html');
                res.end(content);
            }
        });
    };

    const upload = function(req, res) {
        let file = req.files;
        let path = "./public/uploads";
        for (const key in file) {
            let uploadedFile = file[key];
            uploadedFile.mv(`${path}/${uploadedFile.name}`, function(err) {
                if (err) {
                    log(err);
                    res.json([{...err, status: 403}]);
                }else{
                    res.json([{status: 200, statusText: "Upload successful!"}]);
                }
            });
        }
    };

    const update = function(req, res) {
        const formatName = str => {
            const wordArray = str.split(" ").map(word => (word.charAt(0)).toUpperCase()+(word.substring(1)).toLowerCase());
            console.log(wordArray);
            let formattedString = wordArray.join(" ");
            return formattedString;
        };

        const user_username = req.body.username;
        const user_address = `${req.body.state}, ${req.body.country}`;
        const user_email = req.body.email;
        const user_firstname = formatName(req.body.firstname);
        const user_lastname = formatName(req.body.lastname);
        const user_phone = req.body.phone;
        const user_telcode = req.body.telcode;

        let query = `UPDATE users SET firstname='${user_firstname}', lastname='${user_lastname}', telcode='${user_telcode}', phone='${user_phone}', email='${user_email}', address='${user_address}' WHERE username='${user_username}'`;
        
        mysql_config.connection.query(query, function(err, result){
            if(err) {
                log(err);
            }else{
                console.log('User\'s account details updated successfully!');
                res.json(result);
            }
        });
    };

    const auth = function(req, res) {
        const user_username = req.body.username;
        const user_password = req.body.password;

        const query = `SELECT username, password FROM users WHERE username='${user_username}'`;
        mysql_config.connection.query(query, function(err, result){
            if(err) {
                log(err);
            }else{
                let [user1] = result;
                if (result.length === 0){
                    res.redirect(`/login?error=${ph.softEncrypt("not found")}&idn=novalid`);
                }else{
                    if (ph.decrypt(user1.password) === user_password){
                        req.session.username = user_username;
                        res.cookie("ct-username", user_username);
                        res.redirect(`/dashboard?sess=${ph.softEncrypt("success")}&idn=success`);
                    }else{
                        res.redirect(`/login?error=${ph.softEncrypt("not found")}&idn=invalidid`);
                    }
                }
            }
        });
    };

    const register = function(req, res) {
        function genHex(length){
            length = length || 16;
            let counter = 0;
            let generated_hex = "t";
            let characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
            
            while(counter <= length){
                let rand_index = Math.round((Math.random()*characters.length)+1);
                generated_hex += characters.charAt(rand_index);
                counter += 1;
            }
            return generated_hex;
        }

        const formatName = str => {
            const wordArray = str.split(" ").map(word => (word.charAt(0)).toUpperCase()+(word.substring(1)).toLowerCase());
            let formattedString = wordArray.join(" ");
            return formattedString;
        };

        const uuid = genHex(32);
        const user_username = formatName(req.body[`username`]);
        const user_password = req.body[`user-password`];
        const user_email = req.body[`user-email`];
        const user_phone = req.body[`user-mobile`];
        const user_fullname = formatName(req.body[`user-fullname`]);
        const user_plan = req.body[`account-plan`];
        const user_address = `${req.body['user-region']}, ${req.body['user-country']}`;

        let query = `SELECT username, email FROM users WHERE username="${user_username}" OR email="${user_email}"`;

        mysql_config.connection.query(query, function(err, existing_users) {
            if(err){
                log(err);
            }else if(existing_users.length === 0){
                let query = `INSERT INTO users (uID, username, password, fullname, telcode, phone, email, address, account_plan, reg_date, verification_status) VALUES ('${uuid}', '${user_username}', '${ph.encrypt(user_password)}', '${user_fullname}', '', '${user_phone}', '${user_email}', '${user_address}', '${user_plan}', '${(Date.now())}', false)`;
                mysql_config.connection.query(query, function(err){

                    if(err) {
                        log(err);
                    }else{
                        console.log('Inserted successfully!');
                        require("./emailHandler").sendVerificationMail(user_email);
                        req.session.username = user_username;
                        res.cookie("ct-username", user_username);
                        res.redirect(`/verification.html?idn=success&generated_uuid=${ph.softEncrypt(uuid)}`);
                    }
                });

            }else{
                res.redirect(`/register?error=${ph.softEncrypt("not found")}&idn=userexist`);
            }
        });
    };

    return {
        auth,
        register,
        update,
        upload,
        resetHandler: function(req, res) {
            const account_email = req.body["reset-email"];
            console.log(account_email);

            const query = `SELECT email FROM users WHERE email='${account_email}'`;
            mysql_config.connection.query(query, function(err, result){
                if(err) {
                    log(err);
                }else{
                    let [user] = result;

                    if (result.length === 0){
                        res.redirect(`/passwordReset?error=${ph.softEncrypt("not found")}&idn=novalid`);
                    }else{
                        console.log(req.body);
                        const msg = {
                            to: account_email,
                            from: "universone132@gmail.com",
                            subject: "Password Reset Request",
                            text: '...and easy',
                            html: '<strong>Password reset!</strong>'
                        };

                        let report = emailSender(msg);
                        report.then(deliveryReport => {
                            console.log(deliveryReport);
                        }).catch(errorReport => {
                            log(errorReport);
                        });
                        res.end("Password Reset!");
                    }
                }
            });
        },
        index: function(req, res) {
            readFile("./public/index.html", req, res);
        },
        dashboard: function(req, res) {
            readFile("./public/dashboard.html", req, res);
        },
        search: function(req, res) {
            readFile("./public/search.html", req, res);
        },
        myprofile: function(req, res) {
            readFile("./public/profile.html", req, res);
        },
        control: function(req, res) {
            readFile("./public/control.html", req, res);
        },
        productView: function(req, res) {
            res.redirect(`/productView.html?queryItem=${req.params.itemID}`);
        },
        vendorApplication: function(req, res) {
            readFile("./public/vendorApplyForm.html", req, res);
        },
        login: function(req, res) {
            readFile("./public/login.html", req, res);
        },
        signup: function(req, res) {
            readFile("./public/signup.html", req, res);
        },
        reset: function(req, res) {
            readFile("./public/reset.html", req, res);
        },
        logout: function(req, res) {
            req.session.destroy(function (err) {
                if (err) {
                    log(err);
                } else {
                    res.clearCookie("ct-username");
                    res.redirect("/login");
                }
            });
        },
        aboutUs: function(req, res) {
            readFile("./public/dummy.html", req, res);
        },
        pricing: function(req, res) {
            readFile("./public/pricing.html", req, res);
        },
        support: function(req, res) {
            readFile("./public/support.html", req, res);
        },
        admin_page: function (req, res) {
            readFile("./public/admin-page.html", req, res);
        }
    };
};

module.exports = model();