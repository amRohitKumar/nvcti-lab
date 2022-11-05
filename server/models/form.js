const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    uniqueId: {
        type: String,
        required: true 
    },
    institute: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    contact: {
        email: {
            type: String,
            required: true
        },
        mobile: {
            type: Number,
            required: true
        }
    },
    sourceOfFunding: {
        type: String,
        required: false 
    },
    projectTitle: {
        type: String,
        required: true
    },
    projectObjective: {
        type: String,
        required: true
    },
    ideaOfProject: {
        origin: {
            type: String,
            required: true
        },
        methodology: {
            type: String,
            required: true
        },
        outcome: {
            type: String,
            required: true 
        }
    },
    timeOfCompletion: {
        type: Number,
        required: true
    },
    mentor: {
        type: String,
        required: false
    },
    noOfMembers: {
        type: Number,
        required: true
    },
    member: {
        name: {
            type: String,
            required: true
        },
        admissionNo: {
            type: String,
            required: true
        },
        institute: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        contact: {
            email: {
                type: String,
                required: true
            },
            mobile: {
                type: Number,
                required: true
            }
        },
        gender: {
            type: String,
            required: true
        }
    }
})