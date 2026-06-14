'use client'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import ProductPrice from '@/components/shared/product/product-price'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'
import { getVendorInfoForProducts } from '@/lib/actions/vendor.actions'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Store } from 'lucide-react'

type VendorMap = Record<string, { storeName: string; storeSlug: string }>

export default function CartPage() {
  const {
    cart: { items, itemsPrice },
    updateItem,
    removeItem,
  } = useCartStore()

  const router = useRouter()
  const {
    setting: {
      site,
      common: { freeShippingMinPrice },
    },
  } = useSettingStore()

  const t = useTranslations()
  const [vendorMap, setVendorMap] = useState<VendorMap>({})

  // Fetch vendor info for all products in cart
  useEffect(() => {
    if (items.length === 0) return
    const productIds = items.map(i => i.product)
    getVendorInfoForProducts(productIds).then(result => {
      if (result.success) setVendorMap(result.data)
    })
  }, [items])

  // Group items by vendor for display
  const vendorGroups: Record<string, typeof items> = {}
  for (const item of items) {
    const vendor = vendorMap[item.product]
    const key    = vendor?.storeName || 'MarketHub Store'
    if (!vendorGroups[key]) vendorGroups[key] = []
    vendorGroups[key].push(item)
  }

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-4 md:gap-4'>
        {items.length === 0 ? (
          <Card className='col-span-4 rounded-none'>
            <CardHeader className='text-3xl'>
              {t('Cart.Your Shopping Cart is empty')}
            </CardHeader>
            <CardContent>
              {t.rich('Cart.Continue shopping on', {
                name: site.name,
                home: (chunks) => <Link href='/'>{chunks}</Link>,
              })}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className='col-span-3'>
              <Card className='rounded-none'>
                <CardHeader className='text-3xl pb-0'>
                  {t('Cart.Shopping Cart')}
                </CardHeader>
                <CardContent className='p-4'>
                  <div className='flex justify-end border-b mb-4'>
                    {t('Cart.Price')}
                  </div>

                  {/* Group items by vendor */}
                  {Object.entries(vendorGroups).map(([storeName, groupItems]) => {
                    const firstItem  = groupItems[0]
                    const vendor     = vendorMap[firstItem.product]
                    const groupTotal = groupItems.reduce(
                      (sum, i) => sum + i.price * i.quantity, 0
                    )

                    return (
                      <div key={storeName} className='mb-6'>
                        {/* Vendor header */}
                        <div className='flex items-center gap-2 py-2 mb-2
                                        border-b border-dashed'>
                          <Store size={14} className='text-muted-foreground' />
                          {vendor?.storeSlug ? (
                            <Link
                              href={`/store/${vendor.storeSlug}`}
                              className='text-sm font-semibold text-blue-600
                                         hover:underline'
                            >
                              {storeName}
                            </Link>
                          ) : (
                            <span className='text-sm font-semibold'>
                              {storeName}
                            </span>
                          )}
                          <span className='text-xs text-muted-foreground ml-1'>
                            ({groupItems.length} item{groupItems.length !== 1 ? 's' : ''})
                          </span>
                        </div>

                        {/* Items in this vendor group */}
                        {groupItems.map((item) => (
                          <div
                            key={item.clientId}
                            className='flex flex-col md:flex-row justify-between
                                       py-4 border-b gap-4'
                          >
                            <Link href={`/product/${item.slug}`}>
                              <div className='relative w-40 h-40'>
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  sizes='20vw'
                                  style={{ objectFit: 'contain' }}
                                />
                              </div>
                            </Link>

                            <div className='flex-1 space-y-4'>
                              <Link
                                href={`/product/${item.slug}`}
                                className='text-lg hover:no-underline'
                              >
                                {item.name}
                              </Link>
                              <div>
                                <p className='text-sm'>
                                  <span className='font-bold'>
                                    {t('Cart.Color')}:
                                  </span>{' '}
                                  {item.color}
                                </p>
                                <p className='text-sm'>
                                  <span className='font-bold'>
                                    {t('Cart.Size')}:
                                  </span>{' '}
                                  {item.size}
                                </p>
                              </div>
                              <div className='flex gap-2 items-center'>
                                <Select
                                  value={item.quantity.toString()}
                                  onValueChange={(value) =>
                                    updateItem(item, Number(value))
                                  }
                                >
                                  <SelectTrigger className='w-auto'>
                                    <SelectValue>
                                      {t('Cart.Quantity')}: {item.quantity}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent position='popper'>
                                    {Array.from({
                                      length: item.countInStock,
                                    }).map((_, i) => (
                                      <SelectItem
                                        key={i + 1}
                                        value={`${i + 1}`}
                                      >
                                        {i + 1}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant='outline'
                                  onClick={() => removeItem(item)}
                                >
                                  {t('Cart.Delete')}
                                </Button>
                              </div>
                            </div>

                            <div>
                              <p className='text-right'>
                                {item.quantity > 1 && (
                                  <>
                                    {item.quantity} x
                                    <ProductPrice price={item.price} plain />
                                    <br />
                                  </>
                                )}
                                <span className='font-bold text-lg'>
                                  <ProductPrice
                                    price={item.price * item.quantity}
                                    plain
                                  />
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* Vendor subtotal */}
                        <div className='flex justify-end text-sm
                                        text-muted-foreground mt-2'>
                          Subtotal from {storeName}:{' '}
                          <span className='font-medium ml-1'>
                            <ProductPrice price={groupTotal} plain />
                          </span>
                        </div>
                      </div>
                    )
                  })}

                  <div className='flex justify-end text-lg my-2 pt-4 border-t'>
                    {t('Cart.Subtotal')} (
                    {items.reduce((acc, item) => acc + item.quantity, 0)}{' '}
                    {t('Cart.Items')}):{' '}
                    <span className='font-bold ml-1'>
                      <ProductPrice price={itemsPrice} plain />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className='rounded-none'>
                <CardContent className='py-4 space-y-4'>
                  {itemsPrice < freeShippingMinPrice ? (
                    <div className='flex-1'>
                      {t('Cart.Add')}{' '}
                      <span className='text-green-700'>
                        <ProductPrice
                          price={freeShippingMinPrice - itemsPrice}
                          plain
                        />
                      </span>{' '}
                      {t(
                        'Cart.of eligible items to your order to qualify for FREE Shipping'
                      )}
                    </div>
                  ) : (
                    <div className='flex-1'>
                      <span className='text-green-700'>
                        {t('Cart.Your order qualifies for FREE Shipping')}
                      </span>{' '}
                      {t('Cart.Choose this option at checkout')}
                    </div>
                  )}

                  <div className='text-lg'>
                    {t('Cart.Subtotal')} (
                    {items.reduce((acc, item) => acc + item.quantity, 0)}{' '}
                    {t('Cart.items')}):{' '}
                    <span className='font-bold'>
                      <ProductPrice price={itemsPrice} plain />
                    </span>
                  </div>

                  {/* Vendor breakdown in summary */}
                  {Object.keys(vendorGroups).length > 1 && (
                    <div className='text-sm space-y-1 border-t pt-2'>
                      <p className='font-medium text-muted-foreground mb-1'>
                        From {Object.keys(vendorGroups).length} vendors:
                      </p>
                      {Object.entries(vendorGroups).map(([name, groupItems]) => (
                        <div key={name} className='flex justify-between text-xs'>
                          <span>{name}</span>
                          <span>
                            {groupItems.reduce((s, i) => s + i.quantity, 0)} item(s)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => router.push('/checkout')}
                    className='rounded-full w-full'
                  >
                    {t('Cart.Proceed to Checkout')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
      <BrowsingHistoryList className='mt-10' />
    </div>
  )
}