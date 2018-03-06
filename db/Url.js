const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Counter = require('./Counter')

const urlSchema = new Schema({
    url: String,
    created_at: Date,
    count: Number
})



urlSchema.pre('save', function(next) {
    console.log('url pre-save')
    
    let url = this // if use arrow function here, this would be global, not expected url document!!!!

    Counter.findByIdAndUpdate({
        _id: 'url_count'
    }, {
        $inc: {
            count: 1
        }
    }, (err, counter) => {
        if(err) {
            return next(err)
        }
        if(!counter) {
            counter = new Counter({_id: 'url_count', count: 10000})
            counter.save(err => {
                if(err) {
                    next(err)
                }
            })
        }

        url.count = counter.count // `url._id = counter.count` would not effect
        url.created_at = new Date() 
        console.log('saveing url', url)

        next()
    })
})
 
const URL = mongoose.model('URL', urlSchema)



module.exports = URL

