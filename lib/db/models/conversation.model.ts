import { Document, Model, model, models, Schema } from 'mongoose'

export interface IMessage {
  senderId: string
  senderRole: 'buyer' | 'vendor'
  body: string
  createdAt: Date
  readAt?: Date
}

export interface IConversation extends Document {
  _id: string
  buyerId: string
  vendorId: string
  productId?: string
  messages: IMessage[]
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId as unknown as typeof String, ref: 'User', required: true },
    senderRole: { type: String, enum: ['buyer', 'vendor'], required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false }, _id: false }
)

const conversationSchema = new Schema<IConversation>(
  {
    buyerId: { type: Schema.Types.ObjectId as unknown as typeof String, ref: 'User', required: true },
    vendorId: { type: Schema.Types.ObjectId as unknown as typeof String, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId as unknown as typeof String, ref: 'Product' },
    messages: [messageSchema],
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

conversationSchema.index({ buyerId: 1, vendorId: 1, productId: 1 })

const Conversation =
  (models.Conversation as Model<IConversation>) ||
  model<IConversation>('Conversation', conversationSchema)

export default Conversation
