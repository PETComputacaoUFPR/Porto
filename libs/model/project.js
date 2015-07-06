var mongoose = require('mongoose')
var Schema = mongoose.Schema
var User = require('./user')
var Task = require('./task')

// A project from PET Computação
var Project = new Schema({
    name: {
        type: String,
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }],
    color: String,
    leader: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

Project.virtual('timeExpent').get(function() {
    var time = 0
    for(var i in this.tasks) {
        time += this.tasks[i].timeExpent
    }
    return time
})

module.exports = mongoose.model('Project', Project)
