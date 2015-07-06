var mongoose = require('mongoose')
var Schema = mongoose.Schema
var Task = require('./task')
var User = require('./user')

// A User WORKS on a Taks
var Work = new Schema({
    task: {
        type: Schema.Types.ObjectId,
        ref: 'Task'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    start: {
        type: Date,
        default: Date.now,
        required: true
    },
    end: {
        type: Date,
        default: Date.now
    }
})

Work.virtual('timeExpent').get(function() {
    return ((this.end - this.start)/ 100)/ 10
})

module.exports = mongoose.model('Work', Work)
