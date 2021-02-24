/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-commented-out-tests */
import * as firebase from '@firebase/rules-unit-testing'
import * as admin from 'firebase-admin'
import { Document } from '../../Schema/Document'
import {
  testDoc1 /*,testDocumentList*/,
  testDoc2,
  TestDocument,
} from '../data/testDocument'
import { WorkspaceA, WorkspaceB } from '../data/testWorkspace'
import {
  mainAdmin,
  mainUser,
  otherAdmin /*, subAdmin, subUser*/,
} from '../data/testUser'
import { WorkspaceA, WorkspaceB } from '../data/testWorkspace'
import {
  createUserData,
  generateCoverageHtml,
  getFiresbaseByUserAndProjectId,
  // getAdminFirebase,
  getFirestoreByUserAndProjectId,
  insertWorkspaceDocumentByAdmin,
  initUser,
  initWorkspace,
  insertWorkspaceDocumentByAdmin,
  loadFirestoreRules,
} from '../utils'

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
const PROJECT_ID = 'test-document-project'
const TYPE = 'document'

const getFirestoreByUser = (user: initUser) => {
  return getFirestoreByUserAndProjectId(user, PROJECT_ID)
}

const getFirebaseByUser = (user: initUser) => {
  return getFiresbaseByUserAndProjectId(user, PROJECT_ID)
}

beforeAll(async () => {
  loadFirestoreRules(PROJECT_ID)
})

afterAll(async () => {
  await generateCoverageHtml(PROJECT_ID, TYPE)
  await Promise.all(firebase.apps().map((app) => app.delete()))
})

const insertDocument = async (
  user: initUser,
  wid: string,
  { uid, ...data }: TestDocument
) => {
  const app = getFirebaseByUser(user)
  const userRef = (app
    .firestore()
    .collection('users')
    .doc(
      user.uid
    ) as unknown) as admin.firestore.DocumentReference<admin.firestore.DocumentData>
  // TODO: 後でmockをつかう
  const insertData: Document = {
    ...data,
    lastUpdatedBy: {
      name: user.uid,
      ref: userRef,
    },
    analyzeStatus: { ...data.analyzeStatus },
  }
  await app
    .firestore()
    .doc(`workspaces/${wid}/documents/${uid}`)
    .set(insertData)
}

const insertWorkspace = async (data: initWorkspace) => {
  await insertWorkspaceDocumentByAdmin(PROJECT_ID, data)
}

const insertUser = async () => {
  const db1 = getFirebaseByUser(mainUser).firestore()
  await db1.collection('users').doc(mainUser.uid).set(createUserData(mainUser))
  const db2 = getFirebaseByUser(mainAdmin).firestore()
  await db2
    .collection('users')
    .doc(mainAdmin.uid)
    .set(createUserData(mainAdmin))
  const db3 = getFirebaseByUser(otherAdmin).firestore()
  await db3
    .collection('users')
    .doc(otherAdmin.uid)
    .set(createUserData(otherAdmin))
}

describe('Document コレクションの読み取り・書き取りオペレーションのテスト', () => {
  describe('Documentコレクションは管理者ユーザーのみ書き込める', () => {
    beforeEach(async () => {
      // Adminを使うとFieldValueでエラーになるので暫定措置
      // const db = getAdminFirebase(PROJECT_ID).firestore()
      await insertUser()
      await insertWorkspace(WorkspaceA)
    })

    afterEach(async () => {
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })

    test('通常ユーザーはDocumentコレクションに書き込めない', async () => {
      await firebase.assertFails(
        insertDocument(mainUser, WorkspaceA.name, testDoc1)
      )
    })
    test('管理者ユーザーはDocumentコレクションに書き込める', async () => {
      await firebase.assertSucceeds(
        insertDocument(mainAdmin, WorkspaceA.name, testDoc1)
      )
    })
    test('他Workspaceの管理者ユーザーはDocumentコレクションに書き込める', async () => {
      await firebase.assertFails(
        insertDocument(otherAdmin, WorkspaceA.name, testDoc1)
      )
    })
  })

  describe('ユーザーは同じテナントに属するドキュメントを読み取れる', () => {
    beforeAll(async () => {
      // Adminを使うとFieldValueでエラーになるので暫定措置
      // const db = getAdminFirebase(PROJECT_ID).firestore()
      await insertUser()
      await insertWorkspace(WorkspaceA)
      await insertWorkspace(WorkspaceB)
      await insertDocument(mainAdmin, WorkspaceA.name, testDoc1)
      await insertDocument(otherAdmin, WorkspaceB.name, testDoc2)
    })

    afterAll(async () => {
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })

    test('非管理者ユーザーは同じテナントのDocumentコレクション読み取れる', async () => {
      const db = getFirestoreByUser(mainUser)
      const doc = db
        .collection('workspaces')
        .doc(WorkspaceA.name)
        .collection('documents')
        .doc(testDoc1.name)
      await firebase.assertSucceeds(doc.get())
    })

    test('非管理者ユーザーは別のテナントのDocumentコレクション読み取れない', async () => {
      const db = getFirestoreByUser(mainUser)
      const doc = db
        .collection('workspaces')
        .doc(WorkspaceB.name)
        .collection('documents')
        .doc(testDoc2.name)
      await firebase.assertFails(doc.get())
    })
    test('管理者ユーザーは同じテナントのDocumentコレクション読み取れる', async () => {
      const db = getFirestoreByUser(mainAdmin)
      const doc = db
        .collection('workspaces')
        .doc(WorkspaceA.name)
        .collection('documents')
        .doc(testDoc1.name)
      await firebase.assertSucceeds(doc.get())
    })
    test('管理者ユーザーは別のテナントのDocumentコレクション読み取れない', async () => {
      const db = getFirestoreByUser(mainUser)
      const doc = db
        .collection('workspaces')
        .doc(WorkspaceB.name)
        .collection('documents')
        .doc(testDoc2.name)
      await firebase.assertFails(doc.get())
    })
  })

  describe('管理者ユーザーのみ同じテナントに属するドキュメントを更新できる', () => {
    beforeEach(async () => {
      // Adminを使うとFieldValueでエラーになるので暫定措置
      // const db = getAdminFirebase(PROJECT_ID).firestore()
      await insertUser()
      await insertWorkspace(WorkspaceA)
      await insertWorkspace(WorkspaceB)
      await insertDocument(mainAdmin, WorkspaceA.name, testDoc1)
      await insertDocument(otherAdmin, WorkspaceB.name, testDoc2)
    })
    afterEach(async () => {
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })

    const updatedData = {
      name: 'updated1.xxx',
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }

    test('非管理者ユーザーは同じテナントのDocumentコレクションを更新できない', async () => {
      const db = getFirestoreByUser(mainUser)
      await firebase.assertFails(
        db
          .doc(`/workspaces/${WorkspaceA.name}/documents/${testDoc1.uid}`)
          .update(updatedData)
      )
    })
    test('非管理者ユーザーは別のテナントのDocumentコレクションを更新できない', async () => {
      const db = getFirestoreByUser(mainUser)
      await firebase.assertFails(
        db
          .doc(`/workspaces/${WorkspaceB.name}/documents/${testDoc2.uid}`)
          .update(updatedData)
      )
    })
    test('管理者ユーザーは同じテナントのDocumentコレクションを更新できる', async () => {
      const db = getFirestoreByUser(mainAdmin)
      await firebase.assertSucceeds(
        db
          .doc(`/workspaces/${WorkspaceA.name}/documents/${testDoc1.uid}`)
          .update(updatedData)
      )
    })
    test('管理者ユーザーは別のテナントのDocumentコレクションを更新できない', async () => {
      const db = getFirestoreByUser(mainAdmin)
      await firebase.assertFails(
        db
          .doc(`/workspaces/${WorkspaceB.name}/documents/${testDoc2.uid}`)
          .update(updatedData)
      )
    })
  })
  describe('管理者ユーザーのみ同じテナントに属するドキュメントを削除できる', () => {
    beforeEach(async () => {
      await insertUser()
      await insertWorkspace(WorkspaceA)
      await insertWorkspace(WorkspaceB)
      await insertDocument(mainAdmin, WorkspaceA.name, testDoc1)
      await insertDocument(otherAdmin, WorkspaceB.name, testDoc2)
    })

    afterEach(async () => {
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })

    test('非管理者ユーザーは同じテナントのDocumentコレクションを削除できない', async () => {
      const db = getFirestoreByUser(mainUser)
      await firebase.assertFails(
        db
          .doc(`/workspaces/${WorkspaceA.name}/documents/${testDoc1.uid}`)
          .delete()
      )
    })
    test('非管理者ユーザーは別のテナントのDocumentコレクションを削除できない', async () => {
      const db = getFirestoreByUser(mainUser)
      await firebase.assertFails(
        db
          .doc(`/workspaces/${WorkspaceB.name}/documents/${testDoc1.uid}`)
          .delete()
      )
    })
    test('管理者ユーザーは同じテナントのDocumentコレクションを削除できる', async () => {
      const db = getFirestoreByUser(mainAdmin)
      await firebase.assertSucceeds(
        db
          .doc(`/workspaces/${WorkspaceA.name}/documents/${testDoc1.uid}`)
          .delete()
      )
    })
    test('管理者ユーザーは別のテナントのDocumentコレクションを削除できない', async () => {
      const db = getFirestoreByUser(mainAdmin)
      await firebase.assertFails(
        db
          .doc(`/workspaces/${WorkspaceB.name}/documents/${testDoc2.uid}`)
          .delete()
      )
    })
  })
})
