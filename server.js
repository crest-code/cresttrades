"use strict";

// VARIABLE ASSIGNMENTS
const express = require("express");
const helmet = require("helmet");
const app = express();
const server = require("http").createServer(app);
const io =  require("socket.io")(server);
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const compression = require("compression");
const PORT = (process.env.PORT === "" || process.env.PORT === null || process.env.PORT === undefined)? 3520 : process.env.PORT;
const controller = require("./modules/controller");
const config =  require("./modules/config");
const { connection, userTableExist, log } = config;

// APPLICATION SETUP

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Only used during development
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

app.use("/", express.static(__dirname + "/public"));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    secret: "i am a secret",
    resave: true,
    saveUninitialized: true
}));
app.use(fileUpload());

server.listen(PORT, "0.0.0.0", function() {
    console.log("Server started...");
    console.log(`Server currently running on port ${PORT}`);
});

// DATABASE SETUP AND CONNECTION
connection.connect(function(err) {
    if (err) {
        log(err);
    } else {
        console.log('Connected to mysql server!');
        console.log("Checking for mysql initialization requirements...");

        userTableExist();
    }
});

// APPLICATION ROUTING
app.get("/", controller.index);

app.get("/admin-page", controller.admin_page)
app.get("/dashboard", controller.dashboard);
app.get("/login", controller.login);
app.get("/register", controller.signup);
app.get("/passwordReset", controller.reset);
app.get("/logout", controller.logout);
app.get("/support", controller.support);

app.post("/upload", controller.upload);
app.post("/auth", controller.auth); // Login handler
app.post("/register", controller.register); // Sign up/Registration handler
app.post("/myprofile/update", controller.update); // Profile handler
app.post("/resetHandler", controller.resetHandler);

app.use("/api", require("./router/apiRoute"));

// SOCKET CONNECTION
io.on("connection", (socket) => {
    console.log(`User ${socket.id} is Connected`);

    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`);
    });
});