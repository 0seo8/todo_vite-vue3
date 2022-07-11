import * as admin from 'firebase-admin'
admin.initializeApp()


import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
import todo from './routes/todo'
// import './jobs'

const app = express()
app.use(express.json())
app.use(cors())
app.use('/todo', todo)

export const api = functions.https.onRequest(app)


