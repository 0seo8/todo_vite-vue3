import isbot from 'https://cdn.skypack.dev/isbot'
import { Context } from 'netlify:edge'

const APIKEY = Deno.env.get('APIKEY') as string
const USERNAME = Deno.env.get('USERNAME') as string
const PUBLIC_URL = Deno.env.get('PUBLIC_URL') as string

export default async (request: Request, context: Context) => {
  console.log(request.headers.get('user-agent'))
  console.log('request.url', request.url)

  const userAgent = request.headers.get('user-agent')
  const id = request.url.split('/').filter(p => p).reverse()[0]

  if(isbot(userAgent)) {
    console.log('Bot!!')
    const res = await fetch(`https://asia-northeast3-heropy-api.cloudfunctions.net/api/notion/workspaces/${id}`, {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        'apikey': APIKEY,
        'username': USERNAME
      },
    })

    const {title, content, poster} = await res.json()

    return new Response(/* html */ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Heropy's Notion</title>
    
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Notion Clone!" />
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${content}" />
        <meta property="og:image" content="${poster}" />
        <meta property="og:url" content="${PUBLIC_URL}/workspaces/${id}" />
    
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:site" content="Notion Clone!" />
        <meta property="twitter:title" content="${title}" />
        <meta property="twitter:description" content="${content}" />
        <meta property="twitter:image" content="${poster}" />
        <meta property="twitter:url" content="${PUBLIC_URL}/workspaces/${id}" />
      </head>
      <body></body>
    </html>
    `, {
      headers: {
        'content-type': 'text/html; charset=utf-8'
      }
    })
  }

  return await context.next()
}
