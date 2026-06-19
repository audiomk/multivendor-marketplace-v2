'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form, FormControl, FormField,
  FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { UploadButton } from '@/lib/uploadthing'
import { ProductInputSchema } from '@/lib/validator'
import { toSlug } from '@/lib/utils'
import { IProductInput } from '@/types'
import {
  createVendorProduct,
  updateVendorProduct,
} from '@/lib/actions/vendor.actions'

const defaultValues: IProductInput = {
  name:        '',
  slug:        '',
  category:    '',
  images:      [],
  brand:       '',
  description: '',
  price:       0,
  listPrice:   0,
  countInStock: 0,
  numReviews:  0,
  avgRating:   0,
  numSales:    0,
  isPublished: false,
  tags:        [],
  sizes:       ['S', 'M', 'L'],      // ← add
  colors:      ['Black', 'White'],   // ← add
  ratingDistribution: [],
  reviews:     [],
}

export default function VendorProductForm({
  type,
  product,
  productId,
}: {
  type: 'Create' | 'Update'
  product?: IProductInput
  productId?: string
}) {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<IProductInput>({
    resolver: zodResolver(ProductInputSchema),
    defaultValues: product && type === 'Update' ? product : defaultValues,
  })

  const images = form.watch('images')

  async function onSubmit(values: IProductInput) {
    if (type === 'Create') {
      const res = await createVendorProduct(values)
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message })
      } else {
        toast({ description: res.message })
        router.push('/vendor/products')
      }
    }

    if (type === 'Update') {
      if (!productId) return router.push('/vendor/products')
      const res = await updateVendorProduct(productId, values)
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message })
      } else {
        toast({ description: res.message })
        router.push('/vendor/products')
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        {/* Name & Slug */}
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Product name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='slug'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      placeholder='product-slug'
                      className='pl-8'
                      {...field}
                    />
                    <button
                      type='button'
                      onClick={() =>
                        form.setValue('slug', toSlug(form.getValues('name')))
                      }
                      className='absolute right-2 top-2.5 text-sm text-blue-600'
                    >
                      Generate
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category & Brand */}
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder='e.g. Electronics' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='brand'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder='Brand name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Prices & Stock */}
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='listPrice'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>List Price</FormLabel>
                <FormControl>
                  <Input placeholder='0.00' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Sale Price</FormLabel>
                <FormControl>
                  <Input placeholder='0.00' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='countInStock'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type='number' placeholder='0' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Images */}
        <FormField
          control={form.control}
          name='images'
          render={() => (
            <FormItem className='w-full'>
              <FormLabel>Images</FormLabel>
              <Card>
                <CardContent className='space-y-2 mt-2 min-h-48'>
                  <div className='flex justify-start items-center space-x-2 flex-wrap gap-2'>
                    {images.map((image: string) => (
                      <Image
                        key={image}
                        src={image}
                        alt='product image'
                        className='w-20 h-20 object-cover rounded-sm'
                        width={100}
                        height={100}
                      />
                    ))}
                    <FormControl>
                      <UploadButton
                        endpoint='imageUploader'
                        onClientUploadComplete={(res: { url: string }[]) => {
                          form.setValue('images', [...images, res[0].url])
                        }}
                        onUploadError={(error: Error) => {
                          toast({
                            variant: 'destructive',
                            description: `Upload error: ${error.message}`,
                          })
                        }}
                      />
                    </FormControl>
                  </div>
                </CardContent>
              </Card>
              <FormMessage />
            </FormItem>
          )}
        />

{/* Colors */}
<FormField
  control={form.control}
  name='colors'
  render={({ field }) => (
    <FormItem className='w-full'>
      <FormLabel>Colors (comma separated)</FormLabel>
      <FormControl>
        <Input
          placeholder='Black, White, Red'
          value={field.value?.join(', ') || ''}
          onChange={e =>
            field.onChange(
              e.target.value
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean)
            )
          }
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

{/* Sizes */}
<FormField
  control={form.control}
  name='sizes'
  render={({ field }) => (
    <FormItem className='w-full'>
      <FormLabel>Sizes (comma separated)</FormLabel>
      <FormControl>
        <Input
          placeholder='S, M, L, XL'
          value={field.value?.join(', ') || ''}
          onChange={e =>
            field.onChange(
              e.target.value
                .split(',')
                .map((s: string) => s.trim())
                .filter(Boolean)
            )
          }
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

        {/* Description */}
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Describe your product...'
                  className='resize-none'
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Published */}
        <FormField
          control={form.control}
          name='isPublished'
          render={({ field }) => (
            <FormItem className='flex items-center space-x-2'>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Publish immediately</FormLabel>
            </FormItem>
          )}
        />

        <Button
          type='submit'
          size='lg'
          disabled={form.formState.isSubmitting}
          className='w-full'
        >
          {form.formState.isSubmitting
            ? 'Saving...'
            : `${type} Product`}
        </Button>
      </form>
    </Form>
  )
}