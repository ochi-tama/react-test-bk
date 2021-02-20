import firebase from 'firebase/app'
import 'firebase/firestore'
type Workspace = {
  name: string
  member_num: number
  createdAt: firebase.firestore.FieldValue
  updatedAt: firebase.firestore.FieldValue
  // Documents: firebase.firestore.CollectionReference
}

export default Workspace
