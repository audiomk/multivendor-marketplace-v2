import { Model, model, models, Schema, HydratedDocument } from 'mongoose'

export interface IVendorProfile {
  storeName: string
  storeSlug: string
  bio: string
  logo: string
  stripeAccountId: string
  isApproved: boolean
  commission: number
}

export interface IVerification {
  idFrontUrl: string
  idBackUrl: string
  idStatus: 'none' | 'pending' | 'approved' | 'rejected'
  idSubmittedAt?: Date
  idReviewedAt?: Date
  idRejectReason: string
  taxDocUrl: string
  taxExpiryDate?: Date
  taxStatus: 'none' | 'pending' | 'approved' | 'rejected' | 'expired'
  taxSubmittedAt?: Date
  taxReviewedAt?: Date
  taxRejectReason: string
  selfieUrl: string
  selfieStatus: 'none' | 'pending' | 'approved' | 'rejected'
  selfieSubmittedAt?: Date
  selfieReviewedAt?: Date
  selfieRejectReason: string
  isVerified: boolean
}

// 1. Updated interface containing the new password-reset properties
export interface IUser {
  email: string
  name: string
  role: 'User' | 'vendor' | 'admin' | 'Admin'
  password?: string
  image?: string
  emailVerified: boolean
  vendorProfile?: IVendorProfile | null
  verification?: IVerification | null
  resetToken?: string | null           // <-- Added this
  resetTokenExpires?: Date | null      // <-- Added this
}

const vendorProfileSchema = new Schema<IVendorProfile>({
  storeName:       { type: String, default: '' },
  storeSlug:       { type: String, default: '' },
  bio:             { type: String, default: '' },
  logo:            { type: String, default: '' },
  stripeAccountId: { type: String, default: '' },
  isApproved:      { type: Boolean, default: false },
  commission:      { type: Number, default: 10 },
}, { _id: false })

const verificationSchema = new Schema<IVerification>({
  idFrontUrl:          { type: String, default: '' },
  idBackUrl:           { type: String, default: '' },
  idStatus:            { type: String, enum: ['none','pending','approved','rejected'], default: 'none' },
  idSubmittedAt:       { type: Date },
  idReviewedAt:        { type: Date },
  idRejectReason:      { type: String, default: '' },
  taxDocUrl:           { type: String, default: '' },
  taxExpiryDate:       { type: Date },
  taxStatus:           { type: String, enum: ['none','pending','approved','rejected','expired'], default: 'none' },
  taxSubmittedAt:      { type: Date },
  taxReviewedAt:       { type: Date },
  taxRejectReason:     { type: String, default: '' },
  selfieUrl:           { type: String, default: '' },
  selfieStatus:        { type: String, enum: ['none','pending','approved','rejected'], default: 'none' },
  selfieSubmittedAt:   { type: Date },
  selfieReviewedAt:    { type: Date },
  selfieRejectReason:  { type: String, default: '' },
  isVerified:          { type: Boolean, default: false },
}, { _id: false })

const userSchema = new Schema<IUser>(
  {
    email:         { type: String, required: true, unique: true },
    name:          { type: String, required: true },
    role:          { type: String, required: true, default: 'User',
                     enum: ['User', 'vendor', 'admin', 'Admin'] },
    password:      { type: String },
    image:         { type: String },
    emailVerified: { type: Boolean, default: false },
    vendorProfile: { type: vendorProfileSchema, default: null },
    verification:  { type: verificationSchema,  default: null },
    resetToken:        { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
  },
  { timestamps: true }
)

// 2. Cast the model using Model<IUser>
const User = (models.User as Model<IUser>) || model<IUser>('User', userSchema)
export default User

// 3. Optional helper type for elsewhere in your Next.js app
export type UserDocument = HydratedDocument<IUser>