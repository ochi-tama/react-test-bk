/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import * as firebase from '@firebase/rules-unit-testing'
import fb from 'firebase'
import * as admin from 'firebase-admin'
import 'firebase/firestore'
import * as fs from 'fs'
import * as http from 'http'
import * as path from 'path'
import { User } from '../Schema/User'

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'

// const PROJECT_ID = 'test-project'
//const COVERAGE_URL = `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}:userRuleCoverage.html`

const coverageUrl = (projectId: string, type: string): string => {
  return `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${projectId}:${type}RuleCoverage.html`
}

export type initUser = {
  uid: string
  email: string
  role: string
  photoURL?: string
  workspaces?: string[] | null
}

export type initWorkspace = {
  name: string
  member_num: number
}

export const loadFirestoreRules = async (projectId: string): Promise<void> => {
  const rules = fs.readFileSync(
    path.resolve(__dirname, '../../../firestore.rules'),
    'utf8'
  )
  await firebase.loadFirestoreRules({
    projectId: projectId,
    rules: rules,
  })
}

export const generateCoverageHtml = async (
  projectId: string,
  type: string
): Promise<void> => {
  const coverageFile = `coverage/firestore-coverage-${type}.html`
  const fstream = fs.createWriteStream(coverageFile)
  await new Promise((resolve, reject) => {
    http.get(coverageUrl(projectId, type), (res) => {
      res.pipe(fstream, { end: true })
      res.on('end', resolve)
      res.on('error', reject)
    })
  })
}

export const getAdminFirebase = (projectId: string): fb.app.App => {
  const app = firebase.initializeAdminApp({
    projectId: projectId,
  })
  return app
}

export const getFiresbaseByUserAndProjectId = (
  user: initUser,
  projectId: string
): fb.app.App => {
  const app = firebase.initializeTestApp({
    projectId: projectId,
    auth: {
      ...user,
    },
  })

  return app
}

export const getFirestoreByUserAndProjectId = (
  user: initUser,
  projectId: string
): fb.firestore.Firestore => {
  const app = firebase.initializeTestApp({
    projectId: projectId,
    auth: {
      ...user,
    },
  })

  return app.firestore()
}

export const createUserData = (user: initUser): User => {
  return {
    name: user.uid,
    email: user.email,
    role: user.role,
    affilication: null,
    workspaces: user.workspaces ? user.workspaces : [],
    photoURL: 'aiueo.html',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastLoginDate: firebase.firestore.FieldValue.serverTimestamp(),
  }
}

export const insertWorkspaceDocumentByAdmin = async (
  projectId: string,
  workspace: initWorkspace
): Promise<void> => {
  const adminApp = getAdminFirebase(projectId)
  // FieldValueはAdminとClientで使い分ける必要がある
  await adminApp
    .firestore()
    .collection('workspaces')
    .doc(workspace.name)
    .set({
      ...workspace,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
}
