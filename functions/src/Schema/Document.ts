import * as firebase from 'firebase-admin'
type Document = {
  name: string
  tags?: string[]
  size: number
  filePath: string
  pdfPath?: string | null
  type: string | undefined // docx, pptx, pdf
  createdAt: firebase.firestore.FieldValue
  updatedAt: firebase.firestore.FieldValue
  lastUpdatedBy: {
    name: string
    ref: firebase.firestore.DocumentReference<firebase.firestore.DocumentData> // User
  }
  analyzeStatus?: {
    managedId?: string | null
    htmlPath?: string | null
    parsedHtmlPath?: string | null
  }
}

type AnalyzeStatus = {
  managedId?: string | null
  htmlPath?: string | null
  parsedHtmlPath?: string | null
}

export { Document, AnalyzeStatus }
