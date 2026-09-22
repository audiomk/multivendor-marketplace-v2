import { Document, Model, model, models, Schema } from 'mongoose'

export interface IBoost extends Document {
  _id: string
  productId: string
  vendorId: string
  tier: 'featured' | 'deal' | 'spotlight'
  durationDays: number
  price: number
  paymentStatus: 'pending' | 'paid' | 'cancelled'
  paymentMethod: string
  paymentReference: string
  startsAt?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const boostSchema = new Schema<IBoost>(
  {
    productId: { type: Schema.Types.ObjectId as unknown as typeof String, ref: 'Product', required: true },
    vendorId:  { type: Schema.Types.ObjectId as unknown as typeof String, ref: 'User', required: true },
    tier: {
      type: String,
      enum: ['featured', 'deal', 'spotlight'],
      required: true,
    },
    durationDays: { type: Number, required: true },
    price:        { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
    },
    paymentMethod:    { type: String, default: '' },
    paymentReference: { type: String, default: '' },
    startsAt:  { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
)

const Boost = (models.Boost as Model<IBoost>) || model<IBoost>('Boost', boostSchema)
export default Boost
