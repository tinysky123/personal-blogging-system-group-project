
export function substringHTML(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export  function getTokenFromCookie() {
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(row => row.startsWith('tokenId='));
  if (!tokenCookie) return null;
  return tokenCookie.split('=')[1];
}

export  function getUserIdCookie() {
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(row => row.startsWith('userId='));
  if (!tokenCookie) return null;
  return tokenCookie.split('=')[1];
}


export  function getUsernameCookie() {
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(row => row.startsWith('username='));
  if (!tokenCookie) return null;
  return tokenCookie.split('=')[1];
}