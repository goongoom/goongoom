import { db } from '@/src/db'
import { questions, answers } from '@/src/db/schema'
import { sql } from 'drizzle-orm'

async function cleanup() {
  console.log('🧹 Cleaning up sample data...')
  
  try {
    await db.delete(answers)
    console.log('✅ Deleted all answers')
    
    await db.delete(questions)
    console.log('✅ Deleted all questions')
    
    await db.execute(sql`
      DELETE FROM goongoom.users 
      WHERE clerk_id LIKE 'user_2%'
    `)
    console.log('✅ Deleted all sample users (user_2*)')
    
    console.log('✨ Cleanup complete!')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  }
}

cleanup()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
