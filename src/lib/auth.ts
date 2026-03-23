export function isValidPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}
