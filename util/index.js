const mongoose = require('mongoose')

function canConvertObjectId(str) {
    try {
        str = mongoose.Types.ObjectId(str)
        str = null
        
        return true
    } catch(err) {
        return false
    }
}


module.exports = {
    canConvertObjectId
}