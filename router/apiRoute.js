const model = function() {
    const router = require("express").Router();
    const fs = require("fs");
    const controller = require("../modules/controller");
    const { log, connection, mongoConn, itemsDB, iCollection, ObjectID } =  require("../modules/config");
    const ph = require("../modules/passwordHash");

    function forEach(elements, reaction){
        for(let i = 0; i < elements.length; i++){
            (reaction)(elements[i]);
        }
    }

    const readFile = function(path, req, res) {
        fs.readFile(path, "utf8", function(err, content) {
            if (err) {
                log(err);
            } else {
                res.end(content);
            }
        });
    };

    const formatName = function(str){
        let formattedString = (str.charAt(0)).toUpperCase()+(str.substring(1)).toLowerCase();
        return formattedString;
    };

    router.get("/vendors/:username", function(req, res) {
        const sqlQuery = `SELECT * FROM vendors WHERE username='${req.params.username}'`;

        connection.query(sqlQuery, function(err, result) {
            console.log(result);
            if (err) {
                log(err);

            }else if(result.length > 0){
                res.json(result);
            }else{
                res.json([{
                    error: "NonVendorError",
                    code: 404,
                    message: "Not a vendor"
                }]);
            }
        });
    });

    router.get("/allres", function(req, res) {
        const query = `SELECT uID, fullname, username, phone, email, account_plan, reg_date FROM users ORDER BY reg_date ASC`;
        connection.query(query, function(err, users){
            if (err) {
                log(err);
            }else{
                res.json(users);
            }
        });
    });

    router.get("/user/:username", function(req, res){
        const username = req.params.username;

        if(username === req.session.username){
            const query = `SELECT uID, fullname, username, phone, email, address FROM users WHERE username='${username}'`;
            connection.query(query, function(err, result){
                if (err) {
                    log(err);
                }else{
                    let [user] = result;
                    user.firstname = user.fullname.split(' ')[0];
                    user.lastname = user.fullname.split(' ')[1];
                    user.profile_picture = "";
                    res.json(user);
                }
            });
        }else{
            res.json({
                email: "",
                firstname: "",
                lastname: "",
                phone: "",
                profile_picture: "",
                telcode: "",
                uID: "",
                username: ""
            });
        }
    });

    router.get("/user/:username/getSavedItems", function(req, res) {

        mongoConn.then(client => {
            const collection = client.db(`${formatName(req.params.username)}`).collection("savedItems");
            collection.find({}).toArray(function(err, docs) {
                if(err) {
                    log(err);
                }else{
                    res.json(docs);
                }
            });
        }).catch(error => {
            log(error);
        });
    });

    router.get("/user/:username/getCart", function(req, res) {

        mongoConn.then(client => {
            const collection = client.db(`${formatName(req.params.username)}`).collection("myCart");
            collection.find({}).toArray(function(err, docs) {
                if(err) {
                    log(err);
                }else{
                    res.json(docs);
                }
            });
        }).catch(error => {
            log(error);
        });
    });

    router.get("/user/:username/getStoreItems", function(req, res) {
        const query = req.query['query'];

        const sqlQuery = `SELECT sellerID FROM vendors WHERE username='${req.params.username}'`;

        connection.query(sqlQuery, function(err, result) {
            console.log(result);
            if (err) {
                log(err);

            }else if(result.length > 0){

                mongoConn.then(client => {
                    const [sellerID] = result;
                    const collection = client.db(itemsDB).collection(iCollection);

                    collection.find({"sellerID" : sellerID}).sort({postTime: -1}).toArray(function(err, docs) {
                        if(err) {
                            log(err);
                        }else{
                            res.json(docs);
                        }
                    });
                }).catch(error => {
                    log(error);
                });

            }else{
                res.json([{
                    error: "NonVendorError",
                    code: 404,
                    message: "Not a vendor"
                }]);
            }
        });
    });

    router.get("/goods/item-sizes", function(req, res) {
        fs.readFile("./router/support/product-sizes.json", "utf8", function(err, content) {
            if (err) {
                log(err);
            } else {
                res.json(JSON.parse(content));
            }
        });
    });

    router.get("/goods/:itemID", function(req, res) {
        const itemID = req.params.itemID;
        console.log(itemID);
        
        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
            collection.find({"_id" : ObjectID(itemID)}).toArray(function(err, item) {

                if(err) {
                    log(err);
                }else{
                    if(item.length > 0){
                        res.json(item);
                    }else{
                        res.json([{
                            error: "NotFoundError",
                            code: 404,
                            message: "Your item could not be found"
                        }]);
                    }
                }
            });

        }).catch(error => {
            log(error);
        });
    });

    router.get("/goods/all/search", function(req, res) {
        const query = req.query['query'];
        // console.log(query);
        
        let pattern = query;

        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
            collection.createIndex({"item-name": "text"});
            collection.find({$text: {$search: pattern}}).toArray(function(err, docs) {

                if(err) {
                    log(err);
                }else{
                    res.json(docs);
                }
            });

        }).catch(error => {
            log(error);
        });
    });

    
    router.get("/goods/all/mostPopular", function(req, res) {
        const query = req.query['query'];

        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
            collection.find({}).sort({ numberOfSaves: -1 }).limit(10).toArray(function(err, docs) {
                if(err) {
                    log(err);
                }else{
                    res.json(docs);
                }
            });
        }).catch(error => {
            log(error);
        });

    });

    router.post("/goods/save", function(req, res) {
        const uploadPath = `../uploads`;
        const userInput = req.body;
        userInput.postTime = Date.now();
        userInput.numberOfSaves = 0;
        userInput.published = false;


        userInput[`item-image`] = userInput[`item-image`].map((imageUrl, index) => {
            return (imageUrl !== '')? `${uploadPath}/${imageUrl}`: imageUrl;
        });
        console.log(userInput[`item-image`]);

        mongoConn.then(client => {
            const collection = client.db(itemsDB).collection(iCollection);
            collection.insertOne(userInput, function(err, result) {
                if(err) {
                    log(err);
                    res.json([{...err}]);
                }else{
                    console.log("Saving...")
                    // res.redirect("/myprofile/orders?sectid=3");
                    res.json([{...result}]);
                }
            });
        }).catch(error => {
            log(error);
        });
    });

    router.post("/goods/save/:username/addToCart", function(req, res) {

        const username = formatName(req.params.username);
        const item = req.body.item;

        mongoConn.then(client => {
            const collection = client.db(username).collection("myCart");

            collection.update({"_id": item["_id"]}, item, {upsert: true}, function(err, result) {
                if(err) log(err);
                res.json(result);
            });
        }).catch(error => {
            log(error);
        });

    });

    router.post("/goods/save/:username/addToSavedItems", function(req, res) {
        const username = formatName(req.params.username);
        const item = req.body.item;

        mongoConn.then(client => {
            const collection = client.db(username).collection("savedItems");

            collection.update({"_id": item["_id"]}, item, {upsert: true}, function(err, result) {
                if(err) log(err);
                res.json(result);
            });
        }).catch(error => {
            log(error);
        });
    });

    router.get("/categories", function(req, res) {
        const query = `SELECT * FROM categories WHERE 1`;
            
        connection.query(query, function(err, result){
            if (err) {
                log(err);
            }else{
                res.json(result);
            }
        });
    });

    router.get("/countries/all", function(req, res) {
        fs.readFile("./router/support/countries.json", "utf8", function(err, content) {
            if (err) {
                log(err);
            } else {
                res.json(JSON.parse(content));
            }
        });
    });

    router.get("/countries/all/:name/getRegions", function(req, res) {

        const countryName = req.params.name;

        const getFilename = function(countryList) {
            let value = null;

            forEach(countryList, countryObject => {
                if(countryObject.name == countryName && countryObject.filename !== undefined){
                    value = countryObject.filename;
                }
            });

            return value;
        };

        fs.readFile("./router/support/countries.json", "utf8", function(err, content) {
            if (err) {
                log(err);
            } else {
                const countryList = JSON.parse(content);
                let filename = getFilename(countryList);

                if(filename !== null){
                    fs.readFile(`./router/support/countries/${filename}.json`, "utf8", function(err, content) {
                        if (err) {
                            log(err);
                        } else {
                            res.json(JSON.parse(content));
                        }
                    });
                }else{
                    res.json([]);
                }
            }
        });
    });

    return router;
};

module.exports = model();