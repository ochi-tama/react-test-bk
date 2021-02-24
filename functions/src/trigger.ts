/* eslint-disable no-console */
import admin, { db } from './utils/admin'
import { User } from './Schema/User'
import { Document } from './Schema/Document'

interface UserInput {
  uid: string
  email?: string
  name?: string
  photoURL?: string
  workspace?: string
}

export const createUserDoc = async (params: UserInput): Promise<void> => {
  const { uid, name, email, workspace } = params
  const userDoc = db.collection('users').doc(uid)
  const userData: User = {
    name: name,
    email: email,
    role: 'admin', // TODO: 切り替えできるようにする(デフォルトはnon-admin?)
    workspaces: workspace ? [workspace] : [],
    affilication: null,
    photoURL: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLoginDate: admin.firestore.FieldValue.serverTimestamp(),
  }
  try {
    await userDoc.set(userData)
  } catch (error) {
    console.log(error)
  }
}

export interface DocumentInput {
  name: string
  size: number
  workspace: string
  userId: string
}

export const createDocumentDoc = async (
  params: DocumentInput
): Promise<void> => {
  const { name, size, workspace, userId } = params

  const wsRef = db.collection('workspaces').doc(workspace)
  const wsDoc = await wsRef.get()
  // 存在しないWorkspaceへの操作はエラー
  if (!wsDoc) {
    throw new Error('不正なワークスペース')
  }

  const userRef = db.collection('users').doc(userId)
  const userDoc = await userRef.get()
  // 存在しないUserの操作はエラー
  if (!userDoc) {
    throw new Error('不正なユーザー')
  }

  const userData = userDoc.data() as User
  const fileName = name.split('/').slice(-1).pop() as string
  const docData: Document = {
    name: fileName,
    size: size,
    tags: [],
    filePath: name,
    pdfPath: null,
    type: name.split('.').slice(-1).pop(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdatedBy: {
      name: userData.name as string,
      ref: userRef,
    },
    analyzeStatus: {
      managedId: null,
      htmlPath: null,
      parsedHtmlPath: null,
    },
  }
  const docRef = wsRef.collection('documents').doc(fileName)
  await docRef.set(docData)
}

export const updateDocumentDoc = async (
  params: DocumentInput
): Promise<void> => {
  const { name, size, workspace, userId } = params

  const wsRef = db.collection('workspaces').doc(workspace)
  const wsDoc = await wsRef.get()
  // 存在しないWorkspaceへの操作はエラー
  if (!wsDoc) {
    throw new Error('不正なワークスペース')
  }

  const userRef = db.collection('users').doc(userId)
  const userDoc = await userRef.get()
  // 存在しないUserの操作はエラー
  if (!userDoc) {
    throw new Error('不正なユーザー')
  }

  const fileName = name.split('/').slice(-1).pop() as string
  const docRef = wsRef.collection('documents').doc(fileName)
  const docDoc = await docRef.collection('documents').doc(fileName).get()
  if (!docDoc) {
    throw new Error('ドキュメント情報が存在しません')
  }

  const userData = userDoc.data() as User

  const docData: Document = {
    ...(docDoc.data() as Document),
    size: size,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastUpdatedBy: {
      name: userData.name as string,
      ref: userRef,
    },
  }
  await docRef.update(docData)
}
