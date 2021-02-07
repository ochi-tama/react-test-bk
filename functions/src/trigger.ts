import admin, { db } from './utils/admin'
import { User } from './Schema/User'

export const createUserDoc = async (
  uid: string,
  email: string,
  name?: string,
  photoURL?: string
): Promise<void> => {
  const userDoc = db.collection('users').doc(uid)
  const userData: User = {
    name: name,
    email: email,
    role: 'admin',
    tenant: ['tenant-a'],
    affilication: null,
    photoURL: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLoginDate: admin.firestore.FieldValue.serverTimestamp(),
  }
  await userDoc.set(userData)
}
