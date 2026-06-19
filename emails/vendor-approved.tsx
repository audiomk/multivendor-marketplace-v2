import {
  Body, Container, Head, Html,
  Preview, Text, Heading, Hr, Button
} from '@react-email/components'

export default function VendorApprovedEmail({
  vendorName,
  storeName,
  dashboardUrl,
}: {
  vendorName:   string
  storeName:    string
  dashboardUrl: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Your vendor application has been approved!</Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif', background: '#F5F5F5' }}>
        <Container style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
          <div style={{ background: '#006D6B', padding: '20px', borderRadius: '8px 8px 0 0', textAlign: 'center' }}>
            <Heading style={{ color: '#FABB02', margin: 0, fontSize: 24 }}>
              Indaba Cart
            </Heading>
          </div>
          <div style={{ background: '#fff', padding: 24, borderRadius: '0 0 8px 8px' }}>
            <Heading style={{ color: '#006D6B', fontSize: 20 }}>
              🎉 Your Store is Approved!
            </Heading>
            <Text>Hi {vendorName},</Text>
            <Text>
              Great news! Your vendor application for <strong>{storeName}</strong> has
              been approved. You can now start listing products and receiving orders.
            </Text>
            <Hr />
            <Text style={{ fontWeight: 'bold' }}>What to do next:</Text>
            <Text>1. Add your first product to your store</Text>
            <Text>2. Connect your Stripe account to receive payouts</Text>
            <Text>3. Share your store link with customers</Text>
            <Hr />
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <Button
                href={dashboardUrl}
                style={{
                  background: '#006D6B',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: 8,
                  fontWeight: 'bold',
                  textDecoration: 'none',
                }}
              >
                Go to Your Dashboard
              </Button>
            </div>
            <Text style={{ color: '#666', fontSize: 12 }}>
              Welcome to Indaba Cart. We're excited to have you on board!
            </Text>
          </div>
        </Container>
      </Body>
    </Html>
  )
}