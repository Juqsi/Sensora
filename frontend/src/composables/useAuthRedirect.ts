import { useRoute, useRouter } from 'vue-router'

/**
 * Handles safe redirects after login (only internal paths).
 */
export function useAuthRedirect() {
  const route = useRoute()
  const router = useRouter()

  /**
   * Returns the safe redirect path or `/` fallback
   */
  function getRedirectPath(): string {
    const redirect = route.query.redirect?.toString() || '/'
    // Prevent open redirect (external URLs)
    return redirect.startsWith('/') ? redirect : '/'
  }

  /**
   * Call this after login
   */
  function redirectAfterLogin() {
    router.push(getRedirectPath())
  }

  return {
    redirectAfterLogin,
    getRedirectPath,
  }
}
