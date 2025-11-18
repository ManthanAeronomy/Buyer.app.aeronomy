import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { upsertUser, updateLastLogin, deleteUserByClerkId } from '@/lib/user-service'

export async function POST(req: Request) {
  console.log('\n🌐 ===== WEBHOOK RECEIVED =====')
  console.log(`🕐 Timestamp: ${new Date().toISOString()}`)
  
  // Get the Svix headers for verification
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  console.log(`🔐 Webhook ID: ${svix_id}`)
  console.log(`🔐 Signature: ${svix_signature ? '✓ Present' : '✗ Missing'}`)

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Missing Svix headers for webhook verification')
    console.log('=============================\n')
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)
  
  console.log(`📦 Event Type: ${payload.type || 'Unknown'}`)
  console.log(`📄 Payload received, verifying signature...`)

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
    console.log('✅ Signature verified')
  } catch (err) {
    console.error('❌ Error verifying webhook signature:', err)
    console.log('=============================\n')
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type
  console.log(`🎯 Processing event: ${eventType}`)
  console.log('=============================\n')

  try {
    switch (eventType) {
      case 'user.created':
        {
          const { id, email_addresses, username, first_name, last_name, image_url } = evt.data
          const userEmail = email_addresses[0]?.email_address || ''

          console.log('\n🔔 ===== CLERK WEBHOOK: USER CREATED =====')
          console.log(`📧 Email: ${userEmail}`)
          console.log(`🆔 Clerk ID: ${id}`)
          console.log(`👤 Username: ${username || 'Not provided'}`)
          console.log(`📝 Attempting to save to MongoDB Atlas...`)

          try {
            const savedUser = await upsertUser({
              clerkId: id,
              email: userEmail,
              username: username || undefined,
              firstName: first_name || undefined,
              lastName: last_name || undefined,
              imageUrl: image_url || undefined,
              emailVerified: email_addresses[0]?.verification?.status === 'verified',
            })

            console.log('✅ SUCCESS! User saved to MongoDB Atlas')
            console.log(`📊 MongoDB Document ID: ${savedUser._id}`)
            console.log(`📧 Email: ${savedUser.email}`)
            console.log(`🔐 Email Verified: ${savedUser.emailVerified ? 'Yes' : 'No'}`)
            console.log(`🕐 Created At: ${savedUser.createdAt}`)
            console.log('========================================\n')
          } catch (mongoError: any) {
            console.error('❌ FAILED! Could not save user to MongoDB Atlas')
            console.error(`❌ Error: ${mongoError.message}`)
            console.error(`❌ Stack: ${mongoError.stack}`)
            console.log('========================================\n')
            // Re-throw to be caught by outer catch
            throw mongoError
          }
        }
        break

      case 'user.updated':
        {
          const { id, email_addresses, username, first_name, last_name, image_url } = evt.data
          const userEmail = email_addresses[0]?.email_address || ''

          console.log('\n🔔 ===== CLERK WEBHOOK: USER UPDATED =====')
          console.log(`📧 Email: ${userEmail}`)
          console.log(`🆔 Clerk ID: ${id}`)
          console.log(`📝 Attempting to update in MongoDB Atlas...`)

          try {
            const updatedUser = await upsertUser({
              clerkId: id,
              email: userEmail,
              username: username || undefined,
              firstName: first_name || undefined,
              lastName: last_name || undefined,
              imageUrl: image_url || undefined,
              emailVerified: email_addresses[0]?.verification?.status === 'verified',
            })

            console.log('✅ SUCCESS! User updated in MongoDB Atlas')
            console.log(`📊 MongoDB Document ID: ${updatedUser._id}`)
            console.log(`🕐 Updated At: ${updatedUser.updatedAt}`)
            console.log('========================================\n')
          } catch (mongoError: any) {
            console.error('❌ FAILED! Could not update user in MongoDB Atlas')
            console.error(`❌ Error: ${mongoError.message}`)
            console.log('========================================\n')
            throw mongoError
          }
        }
        break

      case 'user.deleted':
        {
          const { id } = evt.data
          
          console.log('\n🔔 ===== CLERK WEBHOOK: USER DELETED =====')
          console.log(`🆔 Clerk ID: ${id}`)
          console.log(`📝 Attempting to delete from MongoDB Atlas...`)

          try {
            await deleteUserByClerkId(id!)
            console.log('✅ SUCCESS! User deleted from MongoDB Atlas')
            console.log('========================================\n')
          } catch (mongoError: any) {
            console.error('❌ FAILED! Could not delete user from MongoDB Atlas')
            console.error(`❌ Error: ${mongoError.message}`)
            console.log('========================================\n')
            throw mongoError
          }
        }
        break

      case 'session.created':
        {
          const { user_id } = evt.data
          
          if (user_id) {
            console.log('\n🔔 ===== CLERK WEBHOOK: SESSION CREATED =====')
            console.log(`🆔 User ID: ${user_id}`)
            console.log(`📝 Updating last login in MongoDB Atlas...`)

            try {
              await updateLastLogin(user_id)
              console.log('✅ SUCCESS! Last login timestamp updated')
              console.log('========================================\n')
            } catch (mongoError: any) {
              console.error('❌ FAILED! Could not update last login')
              console.error(`❌ Error: ${mongoError.message}`)
              console.log('========================================\n')
              // Don't throw - last login update is non-critical
            }
          }
        }
        break

      default:
        console.log(`\n🔔 Unhandled webhook event type: ${eventType}\n`)
    }

    return new Response('Webhook processed successfully', { status: 200 })
  } catch (error: any) {
    console.error('\n❌ ===== WEBHOOK ERROR =====')
    console.error(`❌ Error processing webhook: ${error.message}`)
    console.error(`❌ Stack: ${error.stack}`)
    console.error('===========================\n')
    return new Response(`Error processing webhook: ${error.message}`, {
      status: 500,
    })
  }
}

