import {
  Body, Column, Container, Head, Html,
  Preview, Row, Section, Text, Heading, Hr
} from '@react-email/components'
import { IOrder } from '@/lib/db/models/order.model'

export default function VendorNewOrderEmail({
  order,
  vendorItems,
  vendorPayout,
}: {
  order: IOrder
  vendorItems: any[]
  vendorPayout: number
}) {
  return (
    <Html>
      <Head />
      <Preview>New order received — ${vendorPayout.toFixed(2)} payout</Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', background: '#f9f9f9' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
          <Heading style={{ color: '#111' }}>
            🛒 New Order Received!
          </Heading>
          <Text>
            You have a new order. Here are the details:
          </Text>

          <Section style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Order #{order._id.toString().slice(-6).toUpperCase()}
            </Text>
            <Hr />
            {vendorItems.map((item: any, i: number) => (
              <Row key={i} style={{ marginBottom: 8 }}>
                <Column>
                  <Text style={{ margin: 0 }}>
                    {item.name} × {item.quantity}
                  </Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={{ margin: 0 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}
            <Hr />
            <Row>
              <Column>
                <Text style={{ fontWeight: 'bold' }}>Your Payout</Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{ fontWeight: 'bold', color: '#16a34a' }}>
                  ${vendorPayout.toFixed(2)}
                </Text>
              </Column>
            </Row>
          </Section>

          <Section style={{ marginTop: 16 }}>
            <Text style={{ color: '#666', fontSize: 12 }}>
              Shipping to: {(order.shippingAddress as any)?.fullName},{' '}
              {(order.shippingAddress as any)?.city}
            </Text>
            <Text style={{ color: '#666', fontSize: 12 }}>
              Log in to your vendor dashboard to process this order.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}