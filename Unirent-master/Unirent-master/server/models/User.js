const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @typedef {Object} UserSchema
 * @property {String} name - Full display name of the university student
 * @property {String} email - Validated @paruluniversity.ac.in domain email address
 * @property {String} password - BCrypt-encrypted hash password string
 * @property {String} role - Student permissions rank (student / admin)
 * @property {String} phone - Contact mobile number string
 * @property {Boolean} isPhoneVerified - Verification flag for active 2FA OTP security
 * @property {Number} otpAttempts - Current continuous failed verification attempt counts
 * @property {Boolean} isVerified - Administrative validation flag for physical ID card image upload
 * @property {Number} walletBalance - Active digital currency balance for marketplace transactions
 */
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
    otpAttempts: { type: Number, default: 0 },
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
