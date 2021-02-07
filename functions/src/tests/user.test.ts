/* eslint-disable no-console */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-commented-out-tests */
import { User } from '../Schema/User'
import { createUserDoc } from './../trigger'
import { db } from './../utils/admin'
import { mainAdmin } from './data/testUser'

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'

beforeAll(async () => {
  // loadFirestoreRules(PROJECT_ID)
})

afterAll(async () => {
  // await generateCoverageHtml(PROJECT_ID, TYPE)
  // await Promise.all(firebase.apps().map((app) => app.delete()))
})

// 現状: Auth Trigger の処理は確認しない
describe('User のログイン時のテスト', () => {
  describe('サインアップ成功時にUserドキュメントに登録される', () => {
    beforeEach(async () => {
      // 前処理を書く
    })

    afterEach(async () => {
      // Adminを使うとFieldValueでエラーになるので暫定措置
      // await firebase.clearFirestoreData({ projectId: PROJECT_ID })
      await db.doc(`/users/${mainAdmin.uid}`).delete()
    })

    test('onCreateDocの正常動作確認', async () => {
      await createUserDoc(mainAdmin.uid, mainAdmin.email, mainAdmin.uid)
      const result = await db.doc(`/users/${mainAdmin.uid}`).get()
      const userDoc = result.data() as User

      expect(userDoc.name).toBe(mainAdmin.uid)
      expect(userDoc.email).toBe(mainAdmin.email)
    })
  })
})
