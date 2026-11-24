// Creates (or updates) the system saving categories in Firestore.
// Fixed document ids: running it again updates them instead of duplicating them.
//
// Usage (from the project root):
//   npm i --no-save firebase-admin
//   node scripts/seed-saving-categories.mjs path/to/service-account.json           -> shows what it would write
//   node scripts/seed-saving-categories.mjs path/to/service-account.json --write   -> writes
//
// The key comes from Firebase console > Project settings > Service accounts > Generate new private key.
// Never commit it: scripts/*.json is in .gitignore.
import { readFileSync } from 'node:fs'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// name is a translation key (src/assets/i18n); type follows the stored format of the other system categories.
// color/backgroundColor are only the defaults (from the app presets): each user can change them like any category.
const categories = [
  { id: 'system-saving-home', name: 'Home savings', icon: 'savings', earnsInterest: false, color: '#d81b60', backgroundColor: '#f8bbd0' },
  { id: 'system-saving-free', name: 'Free savings', icon: 'account_balance_wallet', earnsInterest: false, color: '#1e88e5', backgroundColor: '#bbdefb' },
  { id: 'system-saving-rotating', name: 'Rotating savings', icon: 'diversity_3', earnsInterest: false, color: '#fb8c00', backgroundColor: '#ffe0b2' },
  { id: 'system-saving-scheduled', name: 'Scheduled savings', icon: 'event_available', earnsInterest: true, color: '#8e24aa', backgroundColor: '#e1bee7' },
  { id: 'system-saving-fixed-term', name: 'Fixed-term deposit', icon: 'account_balance', earnsInterest: true, color: '#3949ab', backgroundColor: '#c5cae9' },
  { id: 'system-saving-cda', name: 'CDA', icon: 'request_quote', earnsInterest: true, color: '#00897b', backgroundColor: '#b2dfdb' },
  { id: 'system-saving-mutual-fund', name: 'Mutual fund', icon: 'trending_up', earnsInterest: true, color: '#43a047', backgroundColor: '#c8e6c9' },
  { id: 'system-saving-stocks-bonds', name: 'Stocks and bonds', icon: 'poll', earnsInterest: true, color: '#6d4c41', backgroundColor: '#d7ccc8' },
]

const [keyPath, flag] = process.argv.slice(2)
if (!keyPath) {
  console.error('Missing the service account key path. See the usage at the top of this file.')
  process.exit(1)
}
const write = flag === '--write'

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'))
initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

console.log(`Project: ${serviceAccount.project_id}${write ? '' : ' (dry run: add --write to save)'}`)
const batch = db.batch()
for (const { id, ...data } of categories) {
  const document = { ...data, type: 'Saving', owner: 'system', active: true }
  const exists = (await db.collection('categories').doc(id).get()).exists
  console.log(`${exists ? 'update' : 'create'} categories/${id}`, document)
  batch.set(db.collection('categories').doc(id), document, { merge: true })
}
if (write) {
  await batch.commit()
  console.log('Done.')
}
