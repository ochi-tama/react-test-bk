import {
  createDocumentDoc,
  createUserDoc,
  updateDocumentDoc,
} from './../trigger'
import admin, { db } from './../utils/admin'
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-commented-out-tests */
import { testDoc1 } from './data/testDocument'
import { mainAdmin } from './data/testUser'
import { WorkspaceA } from './data/testWorkspace'
import { initWorkspace } from './utils'

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'

beforeAll(async () => {
  // loadFirestoreRules(PROJECT_ID)
})

afterAll(async () => {
  // await generateCoverageHtml(PROJECT_ID, TYPE)
  // await Promise.all(firebase.apps().map((app) => app.delete()))
})

const insertWorkspaceDoc = async (workspace: initWorkspace): Promise<void> => {
  // FieldValueはAdminとClientで使い分ける必要がある
  await db
    .collection('workspaces')
    .doc(workspace.name)
    .set({
      ...workspace,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
}

// 現状: Auth Trigger の処理は確認しない
describe('ドキュメントアップロード時のテスト', () => {
  describe('アップロード成功時にFirestoreにデータを登録する', () => {
    beforeAll(async () => {
      // 前処理を書く
      await insertWorkspaceDoc(WorkspaceA)
      await createUserDoc({
        uid: mainAdmin.uid,
        name: mainAdmin.uid,
        email: mainAdmin.email,
        workspace: WorkspaceA.name,
      })
    })

    afterEach(async () => {
      await db
        .doc(`/workspaces/${WorkspaceA.name}/documents/${testDoc1.name}`)
        .delete()
      await db.doc(`/workspaces/${WorkspaceA.name}`).delete()
      await db.doc(`/users/${mainAdmin.uid}`).delete()
    })

    test('onCreateDocの正常動作確認', async () => {
      await createDocumentDoc({
        name: testDoc1.name,
        size: testDoc1.size,
        workspace: WorkspaceA.name,
        userId: mainAdmin.uid,
      })

      const documentRef = await db
        .doc(`/workspaces/${WorkspaceA.name}/documents/${testDoc1.name}`)
        .get()
      const documentDoc = documentRef.data()

      expect(documentDoc?.name).toBe(testDoc1.name)
    })
  })
})

describe('ドキュメント更新時のテスト', () => {
  describe('ドキュメント成功時にFirestoreにデータを登録する', () => {
    beforeAll(async () => {
      // 前処理を書く
      await insertWorkspaceDoc(WorkspaceA)
      await createUserDoc({
        uid: mainAdmin.uid,
        name: mainAdmin.uid,
        email: mainAdmin.email,
        workspace: WorkspaceA.name,
      })
    })

    beforeEach(async () => {
      await createDocumentDoc({
        name: testDoc1.name,
        size: testDoc1.size,
        workspace: WorkspaceA.name,
        userId: mainAdmin.uid,
      })
    })
    afterEach(async () => {
      await db
        .doc(`/workspaces/${WorkspaceA.name}/documents/${testDoc1.name}`)
        .delete()
      await db.doc(`/workspaces/${WorkspaceA.name}`).delete()
      await db.doc(`/users/${mainAdmin.uid}`).delete()
    })

    test('onCreateDocの正常動作確認', async () => {
      await updateDocumentDoc({
        name: testDoc1.name,
        size: 32,
        workspace: WorkspaceA.name,
        userId: mainAdmin.uid,
      })

      const documentRef = await db
        .doc(`/workspaces/${WorkspaceA.name}/documents/${testDoc1.name}`)
        .get()
      const documentDoc = documentRef.data()

      expect(documentDoc?.name).toBe(testDoc1.name)
      expect(documentDoc?.size).toBe(32)
    })
  })
})
