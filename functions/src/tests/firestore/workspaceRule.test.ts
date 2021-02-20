/* eslint-disable jest/expect-expect */
import * as firebase from '@firebase/rules-unit-testing'
import { mainAdmin, mainUser, otherAdmin, otherUser } from '../data/testUser'
import { WorkspaceA } from '../data/testWorkspace'
import {
  generateCoverageHtml,
  getFirestoreByUserAndProjectId,
  initUser,
  initWorkspace,
  insertWorkspaceDocumentByAdmin,
  loadFirestoreRules,
} from '../utils'
import { getAdminFirebase } from './../utils'

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
const PROJECT_ID = 'test-workspace-project'
const TYPE = 'workspace'

const getFirestoreByUser = (user: initUser) => {
  return getFirestoreByUserAndProjectId(user, PROJECT_ID)
}

beforeAll(async () => {
  loadFirestoreRules(PROJECT_ID)
})

afterAll(async () => {
  await generateCoverageHtml(PROJECT_ID, TYPE)
  await Promise.all(firebase.apps().map((app) => app.delete()))
})

const insertWorkspaceDocument = async (workspace: initWorkspace) => {
  await insertWorkspaceDocumentByAdmin(PROJECT_ID, workspace)
}

describe('Workspaceコレクションの読み取り・書き取りオペレーションのテスト', () => {
  describe('Workspaceコレクションはどのユーザーも作成できない(バックグラウンド関数のみ)', () => {
    beforeEach(async () => {
      const admin = getAdminFirebase(PROJECT_ID)
      await admin.firestore().collection('workspaces').add(WorkspaceA)
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })
    afterEach(async () => {
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })
    test('非管理者はWorkspaceドキュメントを作成できない', async () => {
      const db = getFirestoreByUser(mainUser)
      await firebase.assertFails(db.collection('workspaces').add(WorkspaceA))
    })

    test('管理者はWorkspaceドキュメント作成できない', async () => {
      const db = getFirestoreByUser(mainAdmin)
      await firebase.assertFails(db.collection('workspaces').add(WorkspaceA))
    })
  })
  describe('Workspaceドキュメントはワークスペースに所属するユーザーのみ読み取れる', () => {
    beforeAll(async () => {
      await insertWorkspaceDocument(WorkspaceA)
    })
    afterAll(async () => {
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })

    test('同じワークスペースの非管理者はWorkspaceドキュメントを読み取れる', async () => {
      const db = getFirestoreByUser(mainUser)
      await firebase.assertSucceeds(
        db.collection('workspaces').doc(WorkspaceA.name).get()
      )
    })

    test('同じワークスペースの管理者はWorkspaceドキュメントを読み取れる', async () => {
      const db = getFirestoreByUser(mainAdmin)
      await firebase.assertSucceeds(
        db.collection('workspaces').doc(WorkspaceA.name).get()
      )
    })

    test('違うワークスペースの管理者はWorkspaceドキュメントを読み取れない', async () => {
      const db = getFirestoreByUser(otherAdmin)
      await firebase.assertFails(
        db.collection('workspaces').doc(WorkspaceA.name).get()
      )
    })

    test('違うワークスペースの非管理者はWorkspaceドキュメントを読み取れない', async () => {
      const db = getFirestoreByUser(otherUser)
      await firebase.assertFails(
        db.collection('workspaces').doc(WorkspaceA.name).get()
      )
    })
  })

  describe('Workspaceドキュメントはワークスペースに所属するユーザーのみ更新できる', () => {
    const updated = {
      name: 'updated-tenant',
    }
    beforeEach(async () => {
      await insertWorkspaceDocument(WorkspaceA)
    })
    afterEach(async () => {
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })

    test('同じワークスペースの非管理者はWorkspaceドキュメントを更新できない', async () => {
      const db = getFirestoreByUser(mainUser)
      await firebase.assertFails(
        db.collection('workspaces').doc(WorkspaceA.name).update(updated)
      )
    })

    test('同じワークスペースの管理者はWorkspaceドキュメントを更新できる', async () => {
      const db = getFirestoreByUser(mainAdmin)
      await firebase.assertSucceeds(
        db.collection('workspaces').doc(WorkspaceA.name).update(updated)
      )
    })

    test('違うワークスペースの管理者はWorkspaceドキュメントを更新できない', async () => {
      const db = getFirestoreByUser(otherAdmin)
      await firebase.assertFails(
        db.collection('workspaces').doc(WorkspaceA.name).update(updated)
      )
    })

    test('違うワークスペースの非管理者はWorkspaceドキュメントを更新できない', async () => {
      const db = getFirestoreByUser(otherUser)
      await firebase.assertFails(
        db.collection('workspaces').doc(WorkspaceA.name).update(updated)
      )
    })
  })

  describe('Workspaceドキュメントはシステム以外で削除できない', () => {
    beforeAll(async () => {
      await insertWorkspaceDocument(WorkspaceA)
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })
    afterAll(async () => {
      await firebase.clearFirestoreData({ projectId: PROJECT_ID })
    })

    test('同じワークスペースの非管理者はWorkspaceドキュメントを削除できない', async () => {
      const db = getFirestoreByUser(mainUser)
      await firebase.assertFails(
        db.collection('workspaces').doc(WorkspaceA.name).delete()
      )
    })

    test('同じワークスペースの管理者はWorkspaceドキュメントを削除できない', async () => {
      const db = getFirestoreByUser(mainAdmin)
      await firebase.assertFails(
        db.collection('workspaces').doc(WorkspaceA.name).delete()
      )
    })

    test('違うワークスペースの管理者はWorkspaceドキュメントを削除できない', async () => {
      const db = getFirestoreByUser(otherAdmin)
      await firebase.assertFails(
        db.collection('workspaces').doc(WorkspaceA.name).delete()
      )
    })

    test('違うワークスペースの非管理者はWorkspaceドキュメントを削除できない', async () => {
      const db = getFirestoreByUser(otherUser)
      await firebase.assertFails(
        db.collection('workspaces').doc(WorkspaceA.name).delete()
      )
    })
  })
})
