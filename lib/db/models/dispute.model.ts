import { Schema, models, model } from 'mongoose'

const disputeSchema = new Schema({
  orderId:   { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  buyerId:   { type: Schema.Types.ObjectId, ref: 'User',  required: true },
  vendorId:  { type: Schema.Types.ObjectId, ref: 'User',  required: true },
  reason:    { type: String, required: true },
  details:   { type: String, required: true },
  status:    {
    type:    String,
    enum:    ['open', 'under_review', 'resolved', 'rejected'],
    default: 'open',
  },
  resolution: { type: String, default: '' },
  resolvedAt: { type: Date },
}, { timestamps: true })

const Dispute = models.Dispute || model('Dispute', disputeSchema)
export default Dispute