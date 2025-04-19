import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

//Define interface for User Document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'logistics_manager' | 'operations_manager' | 'rider';
  active: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'logistics_manager', 'operations_manager', 'rider'],
      default: 'rider',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password along with the salt
    this.password = await bcrypt.hash(this.password, salt);
    
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    // Compare the candidate password with the stored hashed password
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    console.log('Password Comparison:', {
      candidateEmail: this.email,
      candidatePasswordLength: candidatePassword.length,
      storedHashedPasswordLength: this.password.length,
      isMatch
    });
    
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

export default mongoose.model<IUser>('User', UserSchema);