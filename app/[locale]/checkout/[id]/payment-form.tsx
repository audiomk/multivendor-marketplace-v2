'use client'

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js'
import { Card, CardContent } from '@/components/ui/card'
import EcoCashConfirmButton from './ecocash-confirm-button'
import PaynowForm from './paynow-form'
import { useToast } from '@/hooks/use-toast'
import {
  approvePayPalOrder,
  createPayPalOrder,
} from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/db/models/order.model'
import { formatDateTime } from '@/lib/utils'

import CheckoutFooter from '../checkout-footer'
import { redirect, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ProductPrice from '@/components/shared/product/product-price'
import StripeForm from './stripe-form'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)
export default function OrderDetailsForm({
  order,
  paypalClientId,
  clientSecret,
}: {
  order: IOrder
  paypalClientId: string
  isAdmin: boolean
  clientSecret: string | null
}) {
  const router = useRouter()
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    expectedDeliveryDate,
    isPaid,
  } = order
  const { toast } = useToast()

  if (isPaid) {
    redirect(`/account/orders/${order._id}`)
  }
  function PrintLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer()
    let status = ''
    if (isPending) {
      status = 'Loading PayPal...'
    } else if (isRejected) {
      status = 'Error in loading PayPal.'
    }
    return status
  }
  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order._id)
    if (!res.success)
      return toast({
        description: res.message,
        variant: 'destructive',
      })
    return res.data
  }
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order._id, data)
    toast({
      description: res.message,
      variant: res.success ? 'default' : 'destructive',
    })
  }

  const CheckoutSummary = () => (
    <Card>
      <CardContent className='p-4'>
        <div>
          <div className='text-lg font-bold'>Order Summary</div>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>Items:</span>
              <span>
                {' '}
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Shipping & Handling:</span>
              <span>
                {shippingPrice === undefined ? (
                  '--'
                ) : shippingPrice === 0 ? (
                  'FREE'
                ) : (
                  <ProductPrice price={shippingPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between'>
              <span> Tax:</span>
              <span>
                {taxPrice === undefined ? (
                  '--'
                ) : (
                  <ProductPrice price={taxPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between  pt-1 font-bold text-lg'>
              <span> Order Total:</span>
              <span>
                {' '}
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>

            {!isPaid && paymentMethod === 'PayPal' && (
              <div>
                <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                  <PrintLoadingState />
                  <PayPalButtons
                    createOrder={handleCreatePayPalOrder}
                    onApprove={handleApprovePayPalOrder}
                  />
                </PayPalScriptProvider>
              </div>
            )}
            {!isPaid && paymentMethod === 'Stripe' && clientSecret && (
              <Elements
                options={{
                  clientSecret,
                }}
                stripe={stripePromise}
              >
                <StripeForm
                  priceInCents={Math.round(order.totalPrice * 100)}
                  orderId={order._id}
                />
              </Elements>
            )}

            {!isPaid && paymentMethod === 'Cash On Delivery' && (
              <Button
                className='w-full rounded-full'
                onClick={() => router.push(`/account/orders/${order._id}`)}
              >
                View Order
              </Button>
            )}

            {!isPaid && paymentMethod === 'EcoCash' && (
              <div className='space-y-3'>
                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='w-8 h-8 bg-green-600 rounded-full flex items-center
                                    justify-center text-white text-xs font-bold'>
                      EC
                    </div>
                    <span className='font-bold text-green-800'>EcoCash Payment</span>
                  </div>
                  <div className='space-y-2 text-sm'>
                    <p className='text-gray-600'>
                      Send payment to the following EcoCash number:
                    </p>
                    <div className='bg-white border border-green-300 rounded p-3'>
                      <p className='text-xs text-gray-500 mb-1'>Merchant Number</p>
                      <p className='text-xl font-bold text-green-700 tracking-wider'>
                        {process.env.NEXT_PUBLIC_ECOCASH_NUMBER || '077 XXX XXXX'}
                      </p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {process.env.NEXT_PUBLIC_ECOCASH_NAME || 'MarketHub'}
                      </p>
                    </div>
                    <div className='bg-white border border-green-300 rounded p-3'>
                      <p className='text-xs text-gray-500 mb-1'>Amount to Send</p>
                      <p className='text-xl font-bold text-gray-900'>
                        <ProductPrice price={totalPrice} plain />
                      </p>
                    </div>
                    <div className='bg-yellow-50 border border-yellow-200 rounded p-2'>
                      <p className='text-xs text-yellow-800'>
                        <strong>Reference:</strong> Use your Order ID as reference
                      </p>
                      <p className='text-xs font-mono text-yellow-900 mt-1'>
                        {order._id.toString().slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className='mt-3 space-y-2'>
                    <p className='text-xs text-gray-500'>
                      Steps: Dial <strong>*151#</strong> → Send Money →
                      Enter number → Enter amount → Enter PIN
                    </p>
                  </div>
                </div>
                <EcoCashConfirmButton orderId={order._id} />
              </div>
            )}

            {/* Paynow integration structural fix */}
            {!isPaid && paymentMethod === 'Paynow' && (
              <div className='space-y-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-8 h-8 bg-[#006D6B] rounded flex items-center
                                  justify-center text-white text-xs font-bold'>
                    PN
                  </div>
                  <span className='font-bold text-[#006D6B]'>Paynow</span>
                </div>
                <PaynowForm orderId={order._id} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <main className='max-w-6xl mx-auto'>
      <div className='grid md:grid-cols-4 gap-6'>
        <div className='md:col-span-3'>
          {/* Shipping Address */}
          <div>
            <div className='grid md:grid-cols-3 my-3 pb-3'>
              <div className='text-lg font-bold'>
                <span>Shipping Address</span>
              </div>
              <div className='col-span-2'>
                <p>
                  {shippingAddress.fullName} <br />
                  {shippingAddress.street} <br />
                  {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}
                </p>
              </div>
            </div>
          </div>

          {/* payment method */}
          <div className='border-y'>
            <div className='grid md:grid-cols-3 my-3 pb-3'>
              <div className='text-lg font-bold'>
                <span>Payment Method</span>
              </div>
              <div className='col-span-2'>
                <p>{paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className='grid md:grid-cols-3 my-3 pb-3'>
            <div className='flex text-lg font-bold'>
              <span>Items and shipping</span>
            </div>
            <div className='col-span-2'>
              <p>
                Delivery date:
                {formatDateTime(expectedDeliveryDate).dateOnly}
              </p>
              <ul>
                {items.map((item) => (
                  <li key={item.slug}>
                    {item.name} x {item.quantity} = {item.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='block md:hidden'>
            <CheckoutSummary />
          </div>

          <CheckoutFooter />
        </div>
        <div className='hidden md:block'>
          <CheckoutSummary />
        </div>
      </div>
    </main>
  )
}