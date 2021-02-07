import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'
dotenv.config()

if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.PROJECT_ID })
}
export const db = admin.firestore()
export const auth = admin.auth()
export default admin
