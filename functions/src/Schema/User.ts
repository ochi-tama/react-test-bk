import firebase from 'firebase/app'
import 'firebase/firestore'
type User = {
  name: string
  email: string
  role: string
  affilication?: string | null
  tenant: string[]
  createdAt: firebase.firestore.FieldValue
  updatedAt: firebase.firestore.FieldValue
  lastLoginDate: firebase.firestore.FieldValue
  // lastLoginIP?: string
  // changelog {} //更新ログを残す場合
}

export { User }