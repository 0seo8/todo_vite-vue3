import { Handler } from '@netlify/functions'
import axios from 'axios'

const { APIKEY , USERNAME} = process.env

const handler: Handler = async (event,) => {
  //event.body는 문자임으로 json.parse를 해줘야합니다.
  const { id, method, data } = JSON.parse(event.body as string) //event.body에서 꺼냅니다(POST에서 가능)
  const { data: returnValue } = await axios({
    url: `https://asia-northeast3-heropy-api.cloudfunctions.net/api/notion/workspaces/${id}`,
    method,
    headers: {
      'content-type': 'application/json',
      'apikey': APIKEY as string,
      'username': USERNAME as string
    },
    data
  })
  return {
    statusCode: 200,
    body: JSON.stringify(returnValue)
  }
}
export { handler }
