var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Project = require('./project')
var User = require('./user')

// A member from PET Computação
var Task = new Schema({
    name: {
        type: String,
        required: true
    },
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    subtasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }],
    status: {
        // Possible status are 'open', 'in progress', 'done'
        type: String,
        required: true,
        default: 'open'
    },
    created: {
        type: Date,
        default: Date.now
    },
    timeExpent: {
        type: Number,
        default: 0,
        required: true
    },
    assignee: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

Task.path('status').validate(function(v) {
    var status = v.toLowerCase()
    return status === 'open' || status === 'in progress' || status == 'done'
}, 'Invalid status')

module.exports = mongoose.model('Task', Task)
