# Hide.new - Paid Email Proxy Service Implementation Plan

## Executive Summary

Transform hi.new into hide.new, a paid email proxy service that requires senders to pay before their messages are delivered. Users get both an email address (username@hide.new) and a web form (hide.new/username) for lead generation and spam prevention.

## Core Concept

1. **Email Proxy**: Users claim username@hide.new email addresses
2. **Payment Gate**: All incoming messages trigger an auto-response with a Stripe payment link
3. **Dual Interface**: Both email (username@hide.new) and web form (hide.new/username)
4. **Lead Generation**: Captures sender information and payment before delivery
5. **Spam Prevention**: Economic barrier prevents unwanted messages

## Technical Architecture Changes

### 1. Database Schema Updates

```prisma
// Update User model
model User {
  id            String    @id
  username      String    @unique // Now used for email: username@hide.new
  email         String    @unique // User's real email for delivery
  // ... existing fields
  
  // New fields
  stripeCustomerId     String?
  defaultPrice         Int       @default(500) // Default $5.00 in cents
  customMessage        String?   // Custom auto-response message
  paymentLinks         PaymentLink[]
  receivedMessages     Message[]
  emailSettings        EmailSettings?
}

// New: Email settings for the proxy
model EmailSettings {
  id                String    @id @default(cuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id])
  
  // Pricing tiers
  defaultPrice      Int       @default(500) // cents
  trustedSenders    TrustedSender[]
  blockedSenders    BlockedSender[]
  
  // Auto-response customization
  autoResponseSubject    String    @default("Payment required to deliver your message")
  autoResponseTemplate   String?   // Custom template
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

// New: Track payment links
model PaymentLink {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  
  // Stripe data
  stripePaymentLinkId    String    @unique
  stripeCheckoutUrl      String
  amount                 Int       // in cents
  
  // Message data
  messageId         String    @unique
  message           Message   @relation(fields: [messageId], references: [id])
  
  // Status
  status            PaymentStatus @default(PENDING)
  paidAt            DateTime?
  stripeSessionId   String?
  
  createdAt         DateTime  @default(now())
  expiresAt         DateTime  // Payment links expire
}

// New: Store messages pending payment
model Message {
  id                String    @id @default(cuid())
  recipientId       String
  recipient         User      @relation(fields: [recipientId], references: [id])
  
  // Sender info
  senderEmail       String
  senderName        String?
  
  // Message content
  subject           String?
  body              String    @db.Text
  headers           Json?     // Store email headers
  
  // Source
  source            MessageSource
  
  // Payment
  paymentLink       PaymentLink?
  
  // Status
  status            MessageStatus @default(PENDING_PAYMENT)
  deliveredAt       DateTime?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

// New: Trusted senders bypass payment
model TrustedSender {
  id                String    @id @default(cuid())
  emailSettingsId   String
  emailSettings     EmailSettings @relation(fields: [emailSettingsId], references: [id])
  
  email             String
  name              String?
  
  createdAt         DateTime  @default(now())
  
  @@unique([emailSettingsId, email])
}

// New: Blocked senders
model BlockedSender {
  id                String    @id @default(cuid())
  emailSettingsId   String
  emailSettings     EmailSettings @relation(fields: [emailSettingsId], references: [id])
  
  email             String
  reason            String?
  
  createdAt         DateTime  @default(now())
  
  @@unique([emailSettingsId, email])
}

enum PaymentStatus {
  PENDING
  COMPLETED
  EXPIRED
  CANCELLED
}

enum MessageStatus {
  PENDING_PAYMENT
  PAID
  DELIVERED
  FAILED
  BLOCKED
}

enum MessageSource {
  EMAIL
  WEB_FORM
  API
}
```

### 2. Email Infrastructure

#### Inbound Email Handling
- **Option 1**: Use Resend's inbound email parsing (if available)
- **Option 2**: Use SendGrid Inbound Parse webhook
- **Option 3**: Use AWS SES with Lambda for email receiving
- **Recommended**: SendGrid for easier setup and better documentation

#### Email Flow
1. Email sent to username@hide.new
2. SendGrid receives and parses email
3. Webhook hits our `/api/inbound-email` endpoint
4. We store the message and create payment link
5. Auto-respond with payment required message
6. After payment, deliver to user's real email

### 3. Stripe Integration

#### Components Needed
- **Stripe Checkout**: For payment collection
- **Payment Links API**: Generate unique payment links
- **Webhooks**: Handle payment completion
- **Customer Portal**: Let users manage settings

#### Payment Flow
1. Message received → Create Stripe Payment Link
2. Send auto-response with payment URL
3. Sender pays via Stripe Checkout
4. Stripe webhook confirms payment
5. Mark message as paid and deliver
6. Optional: Send receipt to sender

### 4. Implementation Phases

#### Phase 1: Foundation (Week 1-2)
- [ ] Update database schema with payment models
- [ ] Set up Stripe account and API integration
- [ ] Create Stripe webhook handlers
- [ ] Build payment link generation system
- [ ] Update user model for username-based emails

#### Phase 2: Email Infrastructure (Week 2-3)
- [ ] Set up SendGrid inbound parse
- [ ] Create `/api/inbound-email` webhook endpoint
- [ ] Build email parsing and storage system
- [ ] Implement auto-response with payment links
- [ ] Create email delivery after payment

#### Phase 3: Web Interface Updates (Week 3-4)
- [ ] Update signup flow for username selection
- [ ] Create email settings dashboard
- [ ] Build message inbox view
- [ ] Add payment tracking interface
- [ ] Implement trusted/blocked sender management

#### Phase 4: Payment & Delivery (Week 4-5)
- [ ] Complete Stripe Checkout integration
- [ ] Build payment confirmation flow
- [ ] Implement message delivery system
- [ ] Add payment receipt emails
- [ ] Create refund handling

#### Phase 5: Advanced Features (Week 5-6)
- [ ] Custom pricing per sender
- [ ] Bulk trusted sender import
- [ ] Analytics dashboard
- [ ] API for programmatic access
- [ ] Custom auto-response templates

### 5. API Endpoints

```typescript
// Inbound email webhook
POST /api/inbound-email
- Receives parsed emails from SendGrid
- Creates message and payment link
- Sends auto-response

// Stripe webhooks
POST /api/stripe/webhook
- checkout.session.completed
- payment_link.payment_completed

// User APIs
GET /api/messages
- List received messages with payment status

POST /api/messages/:id/deliver
- Manually deliver a paid message

POST /api/settings/email
- Update email settings and pricing

POST /api/settings/trusted-senders
- Manage trusted sender list

// Public APIs
POST /api/contact/:username
- Web form submission (existing, updated for payment)
```

### 6. User Experience Flow

#### For Recipients (Hide.new Users)
1. Sign up and choose username
2. Set their delivery email and price
3. Customize auto-response message
4. Manage trusted/blocked senders
5. View message inbox and payments

#### For Senders
1. Send email to username@hide.new OR use hide.new/username form
2. Receive auto-response with payment link
3. Click link → Stripe Checkout
4. Complete payment
5. Receive confirmation
6. Message delivered to recipient

### 7. Security & Privacy Considerations

- **Message Encryption**: Encrypt stored messages at rest
- **Payment Security**: PCI compliance via Stripe
- **Privacy**: Clear data retention policies
- **Sender Verification**: Option to verify sender email
- **Rate Limiting**: Prevent payment link spam

### 8. Monetization Model

- **Free Tier**: 5 messages/month included
- **Pro Tier**: $10/month for unlimited messages + features
- **Revenue Share**: Optional % of payments collected
- **Premium Usernames**: Charge for short usernames

### 9. Migration Strategy

1. **Domain**: Transition from hi.new to hide.new
2. **Existing Users**: Grandfather current users with free tier
3. **Database**: Migrate existing links to new schema
4. **Communication**: Email users about new features

### 10. Technical Decisions

- **Why SendGrid**: Best inbound email parsing
- **Why Stripe Payment Links**: No PCI compliance needed
- **Message Storage**: 30-day retention for unpaid messages
- **Email Validation**: Verify sender emails to prevent spoofing

## Implementation Priority

1. **MVP Features**
   - Basic username claiming
   - Inbound email handling
   - Payment link generation
   - Auto-response system
   - Simple delivery after payment

2. **V2 Features**
   - Trusted sender lists
   - Custom pricing
   - Analytics
   - API access
   - Mobile app

## Success Metrics

- User acquisition rate
- Payment completion rate
- Message delivery rate
- Revenue per user
- Spam reduction effectiveness

## Risk Mitigation

- **Email Deliverability**: Proper SPF/DKIM setup
- **Payment Disputes**: Clear terms of service
- **Abuse Prevention**: Rate limiting and monitoring
- **Legal Compliance**: GDPR/privacy policy updates