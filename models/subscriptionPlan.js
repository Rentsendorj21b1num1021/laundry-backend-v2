import mongoose from 'mongoose'

const subscriptionPlanSchema = new mongoose.Schema(
  {
    // Багц тодорхойлох код (жишээ: STARTER, STANDARD, PRO)
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    // Ижил code-той багцын нөхцөл өөрчлөгдөх бүрд version нэмэгдэнэ.
    // Учир нь: аль хэдийн энэ багцад холбогдсон байгууллагууд хуучин нөхцөлөөрөө
    // үлдэх ёстой (grandfathering) — зөвхөн шинээр холбогдох байгууллага шинэ version авна.
    version: {
      type: Number,
      required: true,
      default: 1
    },

    description: { type: String, trim: true },

    // Сарын үндсэн хураамж (₮)
    total: {
      type: Number,
      required: true,
      min: 0
    },

    // Үндсэн хураамжид багтсан захиалгын тоо/сар
    count: {
      type: Number,
      required: true,
      min: 0
    },

    // count-оос давсан захиалга тутамд нэмэгдэх дүн (₮)
    overagePrice: {
      type: Number,
      default: 0,
      min: 0
    },

    currency: {
      type: String,
      default: 'MNT'
    },

    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active'
    }
  },
  { timestamps: true }
)

// Нэг code-ийн хүрээнд version давхцахгүй
subscriptionPlanSchema.index({ code: 1, version: 1 }, { unique: true })
subscriptionPlanSchema.index({ status: 1 })

export default mongoose.model('SubscriptionPlan', subscriptionPlanSchema)
