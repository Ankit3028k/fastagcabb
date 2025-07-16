import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters long'],
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [
            /^[6-9]\d{9}$/,
            'Please enter a valid 10-digit Indian phone number'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    age: {
        type: Number,
        required: [true, 'Age is required'],
        min: [18, 'Age must be at least 18'],
        max: [100, 'Age cannot exceed 100']
    },
    adharNumber: {
        type: String,
        trim: true,
        match: [
            /^\d{12}$/,
            'Adhar number must be 12 digits'
        ]
    },
    panCardNumber: {
        type: String,
        trim: true,
        uppercase: true,
        match: [
            /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            'Please enter a valid PAN card number'
        ]
    },
    pinCode: {
        type: String,
        required: [true, 'Pin code is required'],
        trim: true,
        match: [
            /^\d{6}$/,
            'Pin code must be 6 digits'
        ]
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    dealerCode: {
        type: String,
        required: [true, 'Dealer code is required'],
        trim: true,
        uppercase: true
    },
    role: {
        type: String,
        enum: ['Electrician', 'Distributor', 'admin'],
        default: 'Electrician'
    },
    // File upload fields
    profilePhoto: {
        type: String,
        required: [true, 'Profile photo is required']
    },
    adharCard: {
        type: String
    },
    panCard: {
        type: String
    },
    bankDetails: {
        type: String
    },
    // Status and verification
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    monthlyPoints: {
        type: Number,
        default: 0
    },
    yearlyPoints: {
        type: Number,
        default: 0
    },
    scannedQRCodes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QRCode'
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const hashedPassword = await bcrypt.hash(this.password, 12);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const User = mongoose.model("User", userSchema);
export default User;
