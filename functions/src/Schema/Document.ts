import firebase from 'firebase/app'
import 'firebase/firestore'
type Document = {
  name: string
  tags?: string[]
  size: number
  filePath: string
  pdfPath?: string | null
  type: string // docx, pptx, pdf
  tenant: string[]
  createdAt: firebase.firestore.FieldValue
  updatedAt: firebase.firestore.FieldValue
  lastUpdatedBy: {
    name: string
    ref: firebase.firestore.DocumentReference // User
  }
  analyzeStatus?: {
    managedId?: string
    htmlPath?: string
    parsedHtmlPath?: string
  }
}

type AnalyzeStatus = {
  managedId?: string
  htmlPath?: string
  parsedHtmlPath?: string
}

export { Document, AnalyzeStatus }
