/** 个人博客用户名规则（与 blog-server username.util 保持一致） */
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const LOGIN_ACCOUNT_MAX_LENGTH = 128;

export const regBlogUsername = /^[a-zA-Z][a-zA-Z0-9_-]{2,19}$/;
export const regBlogUsernameLogin = /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,19}$/;
export const regMobileCN = /^1[3-9]\d{9}$/;
export const regEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailAccount(value: string): boolean {
  const v = String(value || '').trim();
  return (
    v.length >= USERNAME_MIN_LENGTH && v.length <= LOGIN_ACCOUNT_MAX_LENGTH && regEmail.test(v)
  );
}

export function isRegisterAccount(value: string): boolean {
  const v = String(value || '').trim();
  return regBlogUsername.test(v) || regMobileCN.test(v);
}

export function isLoginAccount(value: string): boolean {
  const v = String(value || '').trim();
  return regBlogUsernameLogin.test(v) || regMobileCN.test(v) || isEmailAccount(v);
}

export function validateUsernameForRegister(value: string): string | undefined {
  const v = String(value || '').trim();
  if (!v) return '填写用户名';
  if (isRegisterAccount(v)) return undefined;
  return '请输入 3-20 位字母开头的用户名，或 11 位手机号';
}

export function validateUsernameForLogin(value: string): string | undefined {
  const v = String(value || '').trim();
  if (!v) return '填写用户名';
  if (isLoginAccount(v)) return undefined;
  return '请输入用户名、邮箱或 11 位手机号';
}
