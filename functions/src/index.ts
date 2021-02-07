import { createUserDoc } from './trigger'
import * as functions from 'firebase-functions'

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true })
  response.send('Hello from Firebase!')
})

// サインアップ時に /users/uid にアカウント情報を登録
// TODO: tenantの扱い, 後から設定してもう？ (認証コード？)
export const createUserOnAuthCreate = functions.auth
  .user()
  .onCreate(async (user) => {
    const email = user.email as string
    createUserDoc(user.uid, email, user.displayName)
  })
