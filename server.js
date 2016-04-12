// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var Llama = require('./models/llama');
var User = require('./models/user');
var Task = require('./models/task');
var bodyParser = require('body-parser');
var router = express.Router();
var myMongolabUrl = 'mp4_user:mp4_user@ds019950.mlab.com:19950/mp4_db';

//replace this with your Mongolab URL
mongoose.connect(myMongolabUrl, function (err) {
    if (err) {
        console.log('Connection Error: ', err);
    } else {
        console.log('Connection Succeeded');
    }
});


// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
    extended: true
}));

// All our routes will start with /api
app.use('/api', router);

//Default route here
var homeRoute = router.route('/');

homeRoute.get(function (req, res) {
    res.json({message: 'Hello World!'});
});

//Llama route
//var llamaRoute = router.route('/llamas');
//
//llamaRoute.get(function (req, res) {
//    res.json([{"name": "alice", "height": 12}, {"name": "jane", "height": 13}]);
//});

//Add more routes here

//User route
var usersRoute = router.route('/users');
var userRoute = router.route('/users/:user_id');
var tasksRoute = router.route('/tasks');
var taskRoute = router.route('/tasks/:task_id');

usersRoute.get(function (req, res) {
    console.log(req.query);
    res.send(req.query);
});
usersRoute.post(function (req, res) {
    console.log(req.body);
    User.create({name: req.body.name, email: req.body.email, pendingTasks: []},
        function (err, user) {
            if (err) {
                var errorMsg;
                if (err.name == "ValidationError") {
                    if (err.errors.name && err.errors.email) {
                        errorMsg = "Validation Error: A name is required! An email is required! ";
                    } else if (err.errors.name) {
                        errorMsg = "Validation Error: A name is required! ";
                    } else if (err.errors.email) {
                        errorMsg = "Validation Error: An email is required! ";
                    }
                } else if (err.code == 11000) {
                    errorMsg = "This email already exists";
                }
                res.status(500).json({message: errorMsg, data: []});
            } else {
                res.status(201).json({message: "User added", data: user});
            }
        }
    );
});

usersRoute.options(function (req, res) {
    res.writeHead(200);
    res.end();
});


// Start the server
app.listen(port);
console.log('Server running on port ' + port);
