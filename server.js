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
    User.find(function (err, users) {
        if (err) {
            res.status(500).json({message: err.errors, data: []});
        } else {
            res.status(200).json({message: "OK", data: users});
        }
    });
    var where = eval("(" + req.query.where + ")");
    console.log(req.query.where);
    console.log(where);
    req.query.where = where;
    //res.send(req.query);
});

usersRoute.post(function (req, res) {
    var user = new User(req.body);
    user.save().then(function(product){
        res.status(201).json({message: "User added", data: user});
    },function(err){
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
    });


    //User.create(req.body, function (err, user) {
    //        if (err) {
    //            var errorMsg;
    //            if (err.name == "ValidationError") {
    //                if (err.errors.name && err.errors.email) {
    //                    errorMsg = "Validation Error: A name is required! An email is required! ";
    //                } else if (err.errors.name) {
    //                    errorMsg = "Validation Error: A name is required! ";
    //                } else if (err.errors.email) {
    //                    errorMsg = "Validation Error: An email is required! ";
    //                }
    //            } else if (err.code == 11000) {
    //                errorMsg = "This email already exists";
    //            }
    //            res.status(500).json({message: errorMsg, data: []});
    //        } else {
    //            res.status(201).json({message: "User added", data: user});
    //        }
    //    }
    //);
});

usersRoute.options(function (req, res) {
    res.writeHead(200);
    res.end();
});


tasksRoute.get(function (req, res) {
    Task.find(function (err, tasks) {
        if (err) {
            res.status(500).json({message: err.errors, data: []});
        } else {
            res.status(200).json({message: "OK", data: tasks});
        }
    });
    var where = eval("(" + req.query.where + ")");
    console.log(req.query.where);
    console.log(where);
});


tasksRoute.post(function (req, res) {
    //console.log(req.body);
    var task = new Task({
        name: req.body.name,
        description: req.body.description,
        deadline: req.body.deadline,
        completed: false,
        assignedUser: req.body.assignedUser != undefined ? req.body.assignedUser : "",
        assignedUserName: req.body.assignedUserName != undefined ? req.body.assignedUserName : "unassigned"
    });

    task.save().then(function (product) {
        res.status(201).json({message: "Task added", data: product});
    }, function (err) {
        var nameErr = "";
        var deadlineErr = "";
        var errorMsg = "";
        if (err.name == "ValidationError") {
            if (err.errors.name) {
                if (err.errors.name.kind == "required") {
                    nameErr = " A name is required! ";
                }else{
                    nameErr = err.errors.name.message;
                }
            }
            if (err.errors.deadline) {
                if (err.errors.deadline.kind == "required") {
                    deadlineErr = " A deadline is required! ";
                }else{
                    deadlineErr = err.errors.deadline.message;
                }
            }
            errorMsg = "Validation error: "+nameErr+deadlineErr;
        } else {
            errorMsg = err.name;
        }
        res.status(500).json({message: errorMsg, data: []});
    });
});


// Start the server
app.listen(port);
console.log('Server running on port ' + port);
