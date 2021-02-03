/* eslint-disable jest/expect-expect */
import * as firebase from '@firebase/rules-unit-testing'
import { User } from '../Schema/User'
import {
  mainAdmin,
  mainUser,
  otherAdmin,
  otherUser,
  subAdmin,
  subUser,
} from './data/testUser'
import {
  generateCoverageHtml,
  getFirestoreByUserAndProjectId,
  initUser,
  loadFirestoreRules,
} from './util'

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
const PROJECT_ID = 'test-project'
const TYPE = 'user'

/*
const getFirestoreByAdmin = () => {
  const app = firebase.initializeTestApp({
    projectId: 'read-write-firestore',
    auth: { ...adminUser },
  })
  return app.firestore()
}
const getFirestore = () => {
  const app = firebase.initializeTestApp({
    projectId: 'read-write-firestore',
  })
  return app.firestore()
}
*/

const getFirestoreByUser = (user: initUser) => {
  return getFirestoreByUserAndProjectId(user, PROJECT_ID)
}

const createUserDocument = (user: initUser): User => {
  return {
    name: user.uid,
    email: user.email,
    role: user.role,
    affilication: null,
    tenant: user.tenant ? user.tenant : [],
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastLoginDate: firebase.firestore.FieldValue.serverTimestamp(),
  }
}

beforeAll(async () => {
  loadFirestoreRules(PROJECT_ID)
})

afterAll(async () => {
  await generateCoverageHtml(PROJECT_ID, TYPE)
  await Promise.all(firebase.apps().map((app) => app.delete()))
})

const insertUserDocument = async () => {
  const db = getFirestoreByUser(mainUser)
  const doc = db.collection('users').doc(mainUser.uid)
  await doc.set(createUserDocument(mainUser))
}

describe('Userコレクションの読み取り・書き取りオペレーションのテスト', () => {
  describe('Userコレクションは認証ユーザー本人のみ作成できる', () => {
    afterEach(async () => {
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })
    test('ユーザー本人(非管理者)は自身のUserドキュメント作成できる', async () => {
      const db = getFirestoreByUser(mainUser)
      const doc = db.collection('users').doc(mainUser.uid)
      await firebase.assertSucceeds(doc.set(createUserDocument(mainUser)))
    })

    test('ユーザー本人(管理者)は自身のUserドキュメント作成できる', async () => {
      const db = getFirestoreByUser(mainAdmin)
      const doc = db.collection('users').doc(mainAdmin.uid)
      await firebase.assertSucceeds(doc.set(createUserDocument(mainAdmin)))
    })

    test('本人以外の管理者ユーザーからは作成できない', async () => {
      const db = getFirestoreByUser(subAdmin)
      const doc = db.collection('users').doc(mainUser.uid)
      await firebase.assertFails(doc.set(createUserDocument(mainUser)))
    })

    test('本人以外の非管理者ユーザーからは作成できない', async () => {
      const db = getFirestoreByUser(subUser)
      const doc = db.collection('users').doc(mainUser.uid)
      await firebase.assertFails(doc.set(createUserDocument(mainUser)))
    })

    test('別テナントの非管理者ユーザーからは作成できない', async () => {
      const db = getFirestoreByUser(otherUser)
      const doc = db.collection('users').doc(mainUser.uid)
      await firebase.assertFails(doc.set(createUserDocument(mainUser)))
    })

    test('別テナントの管理者ユーザーからは作成できない', async () => {
      const db = getFirestoreByUser(otherAdmin)
      const doc = db.collection('users').doc(mainUser.uid)
      await firebase.assertFails(doc.set(createUserDocument(mainUser)))
    })
  })

  describe('Userドキュメントは同じテナントの管理者もしくは本人のみが読み取りできる', () => {
    beforeAll(async () => {
      await insertUserDocument()
    })
    afterAll(async () => {
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })

    test('ユーザー本人は自身のドキュメントを読み取れる', async () => {
      const db = getFirestoreByUser(mainUser)
      const doc = db.collection('users').doc(mainUser.uid)
      await firebase.assertSucceeds(doc.get())
    })
    test('同じテナントの管理者はUserドキュメントを読み取れる', async () => {
      const db = getFirestoreByUser(mainAdmin)
      const doc = db.collection('users').doc(mainUser.uid)
      await firebase.assertSucceeds(doc.get())
    })
    test('ユーザーは別テナントのUserドキュメントを読み取れない', async () => {
      const db = getFirestoreByUser(otherUser)
      const doc = db.collection('users').doc(mainUser.uid)
      await firebase.assertFails(doc.get())
    })

    test('管理者は別テナントのUserドキュメントを読み取れない', async () => {
      const db = getFirestoreByUser(otherAdmin)
      const doc = db.collection('users').doc(mainUser.uid)
      await firebase.assertFails(doc.get())
    })
  })
  describe('Userドキュメントは同じテナントの管理者もしくは本人のみが更新できる', () => {
    beforeEach(async () => {
      await insertUserDocument()
    })
    afterEach(async () => {
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })

    test('ユーザー本人は自身のドキュメントを更新できる', async () => {
      const db = getFirestoreByUser(mainUser)
      await firebase.assertSucceeds(
        db.doc(`/users/${mainUser.uid}`).update({ name: 'changeUser' })
      )
    })
    test('同じテナントの管理者はUserドキュメントを更新できない', async () => {
      const db = getFirestoreByUser(mainAdmin)
      await firebase.assertSucceeds(
        db.doc(`/users/${mainUser.uid}`).update({ name: 'changeUser' })
      )
    })
    test('ユーザーは別テナントのUserドキュメントを更新できない', async () => {
      const db = getFirestoreByUser(otherUser)
      await firebase.assertFails(
        db.doc(`/users/${mainUser.uid}`).update({ name: 'changeUser' })
      )
    })

    test('管理者は別テナントのUserドキュメントを更新できない', async () => {
      const db = getFirestoreByUser(otherAdmin)
      await firebase.assertFails(
        db.doc(`/users/${mainUser.uid}`).update({ name: 'changeUser' })
      )
    })
  })
  describe('Userドキュメントは同じテナントの管理者のみ削除できる', () => {
    beforeEach(async () => {
      await insertUserDocument()
    })
    afterEach(async () => {
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })

    test('ユーザー本人は自身のドキュメントを削除できない', async () => {
      const db = getFirestoreByUser(mainUser)
      await firebase.assertFails(db.doc(`/users/${mainUser.uid}`).delete())
    })
    test('同じテナントの管理者はUserドキュメントを削除できる', async () => {
      const db = getFirestoreByUser(mainAdmin)
      await firebase.assertSucceeds(db.doc(`/users/${mainUser.uid}`).delete())
    })
    test('ユーザーは別テナントのUserドキュメントを削除できない', async () => {
      const db = getFirestoreByUser(otherUser)
      await firebase.assertFails(db.doc(`/users/${mainUser.uid}`).delete())
    })

    test('管理者は別テナントのUserドキュメントを削除できない', async () => {
      const db = getFirestoreByUser(otherAdmin)
      await firebase.assertFails(db.doc(`/users/${mainUser.uid}`).delete())
    })
  })
})
