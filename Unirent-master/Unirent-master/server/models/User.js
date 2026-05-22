const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                if (v === 'admin') return true;
                return /^[a-zA-Z0-9._%+-]+@paruluniversity\.ac\.in$/.test(v);
            },
            message: props => `${props.value} is not a valid Parul University email!`
        }
    },
    password: { type: String, required: true },
    image: { type: String, default: '' },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    university: { type: String, required: true },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    isPhoneVerified: { type: Boolean, default: false },
    phoneOtp: { type: String, default: null },
    phoneOtpExpiry: { type: Date, default: null },
    yearOfStudy: { type: String, default: '' },
    enrollmentId: { type: String, default: '' },
    idCardImage: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    walletBalance: { type: Number, default: 0 },
    stats: {
        itemsShared: { type: Number, default: 0 },
        totalRentals: { type: Number, default: 0 },
        moneySaved: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

module.exports = mongoose.model('User', userSchema);
