const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },

    // --- REGISTRATION VERIFICATION FIELDS (Missing before) ---
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    
    // --- OTP FIELDS ---
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    // ------------------
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- THE FIX IS HERE ---
// We removed 'next' from the arguments.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return; // <--- Just 'return' instead of 'next()'
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;