import firebase from 'firebase/app'
import 'firebase/firestore'
export type TestDocument = {
  uid: string
  name: string
  tags: string[]
  size: number
  filePath: string
  pdfPath: string
  type: string
  createdAt: firebase.firestore.FieldValue
  updatedAt: firebase.firestore.FieldValue
  /*
  lastUpdatedBy: {
    name:
    firebase.firestore.DocumentReference
  }
  */
  analyzeStatus?: {
    managedId: string
    htmlPath: string
    parsedHtmlPath: string
  }
}
export const testDoc1 = {
  uid: 'testDoc1',
  name: 'テストドキュメント1.pptx',
  tags: ['powerpoint', 'test'],
  size: 16,
  filePath: '/tmp/tmp2',
  pdfPath: '/tmp/tmp3',
  type: 'pptx',
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  analyzeStatus: {
    managedId: 'tmpdocid1',
    htmlPath: '/fasfa/asfasf/asdfa.html',
    parsedHtmlPath: '/fasfa/asfasf/asdfa.html',
  },
}

export const testDoc2 = {
  uid: 'testDoc2',
  name: 'テストドキュメント2.pptx',
  tags: ['powerpoint', 'test'],
  size: 16,
  filePath: '/tmp/tmp2',
  pdfPath: '/tmp/tmp3',
  type: 'pptx',
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  analyzeStatus: {
    managedId: 'tmpdocid2',
    htmlPath: '/fasfa/asfasf/asdfa.html',
    parsedHtmlPath: '/fasfa/asfasf/asdfa.html',
  },
}

export const testDoc3 = {
  uid: 'testDoc3',
  name: 'テストドキュメント3.pptx',
  tags: ['powerpoint', 'test'],
  size: 16,
  filePath: '/tmp/tmp3',
  pdfPath: '/tmp/tmp4',
  type: 'pptx',
  analyzeStatus: {
    managedId: 'tmpdocid3',
    htmlPath: '/fasfa/asfasf/asdfa.html',
    parsedHtmlPath: '/fasfa/asfasf/asdfa.html',
  },
}

export const testDocumentList = [testDoc1, testDoc2, testDoc3]
