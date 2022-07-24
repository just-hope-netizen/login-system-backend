import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userVerification = new Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    uniqueString: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: Date,
    expiresAt:Date

})

const UserVerification = mongoose.model('UserVerification', userVerification);
export default UserVerification;
