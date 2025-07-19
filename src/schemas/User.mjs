import mongoose from 'mongoose'

let UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    githubusername: {
        type: String,
        required: false,
    },
    pat: {
        type: String,
        unique: true,
        required: false,
    },
    institute: {
        type: String,
        required: true,
    },
    primarywork: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: false,
    },
    bio: {
        type: String,
        required: false,
    },
    skills: {
        type: [String],
        required: false,
    },
    projects: {
        type: [String],
        required: false,
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    created_at: {
        type: Date,
        default: Date.now,
    },
    friendRequests: [{
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
})



export let User = mongoose.model('User', UserSchema);