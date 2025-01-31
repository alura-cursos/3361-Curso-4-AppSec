import crypto from 'crypto'

function encryptPassword (password): string {
  const iv = crypto.randomBytes(12)
  const key = crypto.scryptSync(process.env.SECRET_KEY_CRYPTO as string, 'salt', 32)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(password, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  const encryptedData = encrypted + authTag.toString("hex")
  return iv.toString('hex') + ':' + encryptedData
}

function decryptPassword (encryptedPassword: string): string {
  const [ivHex, encryptedData] = encryptedPassword.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const key = crypto.scryptSync(process.env.SECRET_KEY_CRYPTO as string, 'salt', 32)
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  const authTagHex = encryptedData.slice(-32); 
  const encryptedHex = encryptedData.slice(0, -32);
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export { encryptPassword, decryptPassword }
