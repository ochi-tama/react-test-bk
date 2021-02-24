/* eslint-disable no-console */
import * as functions from 'firebase-functions'
import {
  createDocumentDoc,
  createUserDoc,
  DocumentInput,
  updateDocumentDoc,
} from './trigger'

// サインアップ時に /users/uid にアカウント情報を登録
// TODO: tenantの扱い, 後から設定してもう？ (認証コード？)
export const createUserOnAuthCreate = functions.auth
  .user()
  .onCreate(async (user) => {
    const params = {
      uid: user?.uid,
      email: user?.email,
      name: user?.displayName,
    }
    createUserDoc(params)
  })

// サインアップ時に custom claim を設定
// 時期に取り除く
export const createDocumentOnStorageCreate = functions.storage
  .object()
  .onFinalize(async (object, context) => {
    const { name, size, metadata, metageneration } = object

    const userId = metadata?.['lastUpdatedBy']
    const workspace = metadata?.['workspace']

    if (userId != null && workspace != null) {
      const params: DocumentInput = {
        userId: userId,
        name: name as string,
        size: (size as unknown) as number,
        workspace: workspace,
      }
      // new object
      if (metageneration === '1') {
        await createDocumentDoc(params)
      } else {
        await updateDocumentDoc(params)
      }
    } else {
      throw new Error('不正なオブジェクトアップロード')
    }
  })
