import * as express from 'express'
import * as admin from 'firebase-admin'
import {saveFile} from '../utils'

const db = admin.firestore()
const router = express.Router()

interface Todo {
  id?: string
  title: string,
  image?: string | null,
  done: boolean,
  createdAt: string,
  updateAt: string,
  deleted: boolean
}

//투두 조회
router.get('', async (req, res) => {
  const snaps = await db.collection('Todos')
    .where('deleted', '!=', true)
    .get()
  const todos: Todo[] = []

  snaps.forEach(snap => {
    const fields = snap.data()
    todos.push({
      id: snap.id,
      ...fields as Todo
    })
  })

  todos.sort((a, b) => {
    const aTime :number = new Date(a.createdAt).getTime()
    const bTime :number = new Date(b.createdAt).getTime()
    return bTime-aTime
  })

  res.status(200).json(todos)
})

//투두 추가
router.post('/', async (req, res) => {
  const {title, imageBase64} = req.body //1. images를 꺼내옵니다.
  const date = new Date().toISOString()

  const image= await saveFile(imageBase64)

  const todo = {
    title,
    image, 
    done: false,
    createdAt: date,
    updatedAt: date,
    deleted: false
  }

  const ref = await db.collection('Todos').add(todo) 

  //생성된 데이터를 응답
  res.status(200).json({
    id: ref.id,
    ...todo
  })
})

//투두수정
router.put('/:id', async(req, res) => {
  const {title, done, imageBase64} = req.body 
  const {id} = req.params

  const snap = await db.collection('Todos').doc(id).get()
  if(!snap.exists) {
    return res.status(404).json('존재하지 않는 정보입니다.')
  }

  const image= await saveFile(imageBase64)

  const { createdAt } = snap.data() as Todo
  const updatedAt = new Date().toDateString()

  await snap.ref.update({
    title,
    image,
    done,
    updatedAt
  })

  return res.status(200).json({
    id: snap.id,
    title,
    image,
    done,
    createdAt,
    updatedAt
  })
})

//todo 삭제
router.delete('/:id', async(req, res) => {
  const {id} = req.params
  const snap = await db.collection('Todos').doc(id).get()

  // 예외처리
  if(!snap.exists) {
    return res.status(404).json('존재하지 않는 정보입니다.')
  }
  await snap.ref.update({
    deleted: true //이렇게 있으면 지어진 데이터로 취급
  })

  res.status(200).json(true)
  return 
})

export default router
