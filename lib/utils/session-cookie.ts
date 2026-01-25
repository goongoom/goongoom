const HOME_REDIRECTED_COOKIE = 'home_redirected'

export function hasRedirectedToProfileThisSession(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.includes(`${HOME_REDIRECTED_COOKIE}=1`)
}

export function markRedirectedToProfile(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${HOME_REDIRECTED_COOKIE}=1;path=/;SameSite=Lax`
}
