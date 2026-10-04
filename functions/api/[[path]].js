export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  // 将请求代理转发到 Render后端
  const backendUrl = `https://travel-server-1q2f.onrender.com${url.pathname}${url.search}`;
  
  return fetch(backendUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });
}