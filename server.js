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

var parseUserError = function (err) {
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
    return errorMsg;
};

var parseTaskError = function (err) {
    var nameErr = "";
    var deadlineErr = "";
    var errorMsg = "";
    if (err.name == "ValidationError") {
        if (err.errors.name) {
            if (err.errors.name.kind == "required") {
                nameErr = " A name is required! ";
            } else {
                nameErr = err.errors.name.message;
            }
        }
        if (err.errors.deadline) {
            if (err.errors.deadline.kind == "required") {
                deadlineErr = " A deadline is required! ";
            } else {
                deadlineErr = err.errors.deadline.message;
            }
        }
        errorMsg = "Validation error: " + nameErr + deadlineErr;
    } else {
        errorMsg = err.name;
    }
    return errorMsg;
};

usersRoute.get(function (req, res) {
    var where = eval("(" + req.query.where + ")");
    var sort = eval("(" + req.query.sort + ")");
    var select = eval("(" + req.query.select + ")");
    var skip = eval("(" + req.query.skip + ")");
    var limit = eval("(" + req.query.limit + ")");
    var count = eval("(" + req.query.count + ")");
    var document = User.find(where);
    if(count){
        document.count(function(err, count){
            if(err) {
                res.status(500).json({message: err.errors, data: []});
            }else{
                res.status(200).json({message: "OK", data: count});
            }
        });
    }else{
        document.sort(sort).skip(skip).limit(limit).select(select).exec(function(err, users) {
            if(err) {
                res.status(500).json({message: err.errors, data: []});
            }else{
                res.status(200).json({message: "OK", data: users});
            }
        });
    }
});

usersRoute.post(function (req, res) {
    var user = new User(req.body);
    user.save().then(function (product) {
        res.status(201).json({message: "User added", data: user});
    }, function (err) {
        res.status(500).json({message: parseUserError(err), data: []});
    });
});

userRoute.get(function (req, res) {
    //User.findById(req.params.user_id).then(function (product) {
    //    res.status(200).json({message: "OK", data: product});
    //}, function (err) {
    //    res.status(404).json({message: "User not found", data: []});
    //});

    User.findById(req.params.user_id, function(err, user){
        if(err || !user){
            res.status(404).json({message: "User not found", data: []});
        }else{
            res.status(200).json({message: "OK", data: user});
        }
    });
});

userRoute.put(function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var pendingTasks = req.body.pendingTasks;
    User.findByIdAndUpdate(req.params.user_id,
        {name: name, email: email, pendingTasks: pendingTasks},
        {new: true, runValidators: true},
        function (err, user) {
            if (err) {
                if (err.kind == "ObjectId") {
                    res.status(404).json({message: "User not found", data: []});
                } else {
                    res.status(500).json({message: parseUserError(err), data: []});
                }
            } else if (!user) {
                res.status(404).json({message: "User not found", data: []});
            } else {
                res.status(200).json({message: "User updated", data: user});
            }
        });
});

userRoute.delete(function (req, res) {
    User.findByIdAndRemove(req.params.user_id,
        function (err, user) {
            if(err || !user){
                res.status(404).json({message: "User not found", data: []});
            }else{
                res.status(200).json({message: "User deleted", data: user});
            }
        });
});


tasksRoute.get(function (req, res) {
    var where = eval("(" + req.query.where + ")");
    var sort = eval("(" + req.query.sort + ")");
    var select = eval("(" + req.query.select + ")");
    var skip = eval("(" + req.query.skip + ")");
    var limit = eval("(" + req.query.limit + ")");
    var count = eval("(" + req.query.count + ")");
    var document = Task.find(where);
    if(count){
        document.count(function(err, count){
            if(err) {
                res.status(500).json({message: err.errors, data: []});
            }else{
                res.status(200).json({message: "OK", data: count});
            }
        });
    }else{
        document.sort(sort).skip(skip).limit(limit).select(select).exec(function(err, tasks) {
            if(err) {
                res.status(500).json({message: err.errors, data: []});
            }else{
                res.status(200).json({message: "OK", data: tasks});
            }
        });
    }
});

tasksRoute.post(function (req, res) {
    //console.log(req.body);
    var task = new Task({
        name: req.body.name,
        description: req.body.description,
        deadline: req.body.deadline,
        completed: false,
        //assignedUser: req.body.assignedUser != undefined ? req.body.assignedUser : "",
        //assignedUserName: req.body.assignedUserName != undefined ? req.body.assignedUserName : "unassigned",
        assignedUser: req.body.assignedUser,
        assignedUserName: req.body.assignedUserName
    });

    task.save().then(function (product) {
        res.status(201).json({message: "Task added", data: product});
    }, function (err) {
        res.status(500).json({message: parseTaskError(err), data: []});
    });
});


taskRoute.get(function (req, res) {
    //Task.findById(req.params.task_id).then(function (product) {
    //    res.status(200).json({message: "OK", data: product});
    //}, function (err) {
    //    res.status(404).json({message: "Task not found", data: []});
    //});

    Task.findById(req.params.task_id, function(err, task){
        if(err || !task){
            res.status(404).json({message: "Task not found", data: []});
        }else{
            res.status(200).json({message: "OK", data: product});
        }
    });
});

taskRoute.put(function (req, res) {
    var task = {
        name: req.body.name,
        description: req.body.description,
        deadline: req.body.deadline,
        completed: req.body.completed,
        assignedUserName: req.body.assignedUserName
    };

    Task.findByIdAndUpdate(req.params.task_id,
        task,
        {new: true, runValidators: true},
        function (err, newTask) {
            if (err) {
                if (err.kind == "ObjectId") {
                    res.status(404).json({message: "Task not found", data: []});
                } else {
                    res.status(500).json({message: parseTaskError(err), data: []});
                }
            } else if (!newTask) {
                res.status(404).json({message: "Task not found", data: []});
            } else {
                res.status(200).json({message: "Task updated", data: newTask});
            }
        });
});

taskRoute.delete(function (req, res) {
    Task.findByIdAndRemove(req.params.task_id,
        function (err, task) {
            if(err || !task) {
                res.status(404).json({message: "Task not found", data: []});
            }else{
                res.status(200).json({message: "Task deleted", data: task});
            }

            //if (err) {
            //    if (err.kind == "ObjectId") {
            //        res.status(404).json({message: "Task not found", data: []});
            //    }
            //} else if (!task) {
            //    res.status(404).json({message: "Task not found", data: []});
            //} else {
            //    res.status(200).json({message: "Task deleted", data: task});
            //}
        });
});


usersRoute.options(function (req, res) {
    res.writeHead(200);
    res.end();
});
tasksRoute.options(function (req, res) {
    res.writeHead(200);
    res.end();
});
//userRoute.options(function (req, res) {
//    res.writeHead(200);
//    res.end();
//});
//taskRoute.options(function (req, res) {
//    res.writeHead(200);
//    res.end();
//});


// Start the server
app.listen(port);
console.log('Server running on port ' + port);
