/**
 * Webhook service for sending lot events to external systems (e.g., Producer Dashboard)
 */

export type LotWebhookEvent = 'lot.created' | 'lot.updated' | 'lot.deleted' | 'lot.published'

export interface LotWebhookPayload {
  event: LotWebhookEvent
  timestamp: string
  lot: {
    _id: string
    orgId: string
    postedBy: string
    title: string
    description?: string
    type: string
    status: string
    volume: {
      amount: number
      unit: string
    }
    pricing: {
      price: number
      currency: string
      pricePerUnit?: number
      paymentTerms?: string
    }
    delivery?: {
      deliveryDate?: string
      deliveryLocation?: string
      deliveryMethod?: string
      incoterms?: string
    }
    compliance?: {
      certificates?: string[]
      standards?: string[]
      ghgReduction?: number
      sustainabilityScore?: number
    }
    tags?: string[]
    airlineName?: string
    publishedAt?: string
    expiresAt?: string
    createdAt: string
    updatedAt: string
  }
  organization?: {
    _id: string
    name: string
    branding?: {
      logo?: string
      brandName?: string
    }
  }
}

/**
 * Send webhook to producer dashboard
 */
export async function sendLotWebhook(
  event: LotWebhookEvent,
  lot: any,
  organization?: any
): Promise<void> {
  const webhookUrl = process.env.PRODUCER_DASHBOARD_WEBHOOK_URL
  const webhookSecret = process.env.PRODUCER_DASHBOARD_WEBHOOK_SECRET

  // Skip if webhook URL is not configured
  if (!webhookUrl) {
    console.log('⚠️  Producer Dashboard webhook URL not configured, skipping webhook')
    return
  }

  try {
    // Prepare payload
    const payload: LotWebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      lot: {
        _id: lot._id?.toString() || lot._id,
        orgId: lot.orgId?.toString() || lot.orgId,
        postedBy: lot.postedBy,
        title: lot.title,
        description: lot.description,
        type: lot.type,
        status: lot.status,
        volume: lot.volume,
        pricing: lot.pricing,
        delivery: lot.delivery
          ? {
              deliveryDate: lot.delivery.deliveryDate
                ? new Date(lot.delivery.deliveryDate).toISOString()
                : undefined,
              deliveryLocation: lot.delivery.deliveryLocation,
              deliveryMethod: lot.delivery.deliveryMethod,
              incoterms: lot.delivery.incoterms,
            }
          : undefined,
        compliance: lot.compliance
          ? {
              certificates: lot.compliance.certificates?.map((c: any) =>
                c._id ? c._id.toString() : c.toString()
              ),
              standards: lot.compliance.standards,
              ghgReduction: lot.compliance.ghgReduction,
              sustainabilityScore: lot.compliance.sustainabilityScore,
            }
          : undefined,
        tags: lot.tags,
        airlineName: lot.airlineName,
        publishedAt: lot.publishedAt ? new Date(lot.publishedAt).toISOString() : undefined,
        expiresAt: lot.expiresAt ? new Date(lot.expiresAt).toISOString() : undefined,
        createdAt: lot.createdAt ? new Date(lot.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: lot.updatedAt ? new Date(lot.updatedAt).toISOString() : new Date().toISOString(),
      },
      organization: organization
        ? {
            _id: organization._id?.toString() || organization._id,
            name: organization.name,
            branding: organization.branding,
          }
        : undefined,
    }

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'Aeronomy-Marketplace/1.0',
    }

    // Add webhook secret as Authorization header if provided
    if (webhookSecret) {
      headers['Authorization'] = `Bearer ${webhookSecret}`
    }

    // Send webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Webhook failed with status ${response.status}: ${errorText || response.statusText}`
      )
    }

    console.log(`✅ Webhook sent successfully: ${event} for lot ${lot._id}`)
  } catch (error: any) {
    // Log error but don't throw - webhook failures shouldn't break the main flow
    console.error(`❌ Failed to send webhook for ${event}:`, error.message)
    // In production, you might want to queue failed webhooks for retry
  }
}

/**
 * Send webhook after lot is created
 */
export async function notifyLotCreated(lot: any, organization?: any): Promise<void> {
  await sendLotWebhook('lot.created', lot, organization)
}

/**
 * Send webhook after lot is updated
 */
export async function notifyLotUpdated(lot: any, organization?: any): Promise<void> {
  await sendLotWebhook('lot.updated', lot, organization)
  
  // Also send published event if status changed to published
  if (lot.status === 'published') {
    await sendLotWebhook('lot.published', lot, organization)
  }
}

/**
 * Send webhook after lot is deleted
 */
export async function notifyLotDeleted(lot: any, organization?: any): Promise<void> {
  await sendLotWebhook('lot.deleted', lot, organization)
}



