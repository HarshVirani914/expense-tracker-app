import { parse, isValid } from 'date-fns'

// Maps common column name variants to canonical field names
export const HEADER_ALIASES: Record<string, string> = {
  // date
  'transaction date': 'date',
  'trans date': 'date',
  'txn date': 'date',
  'value date': 'date',
  'posting date': 'date',
  'trans_date': 'date',
  'txn_date': 'date',
  'transaction_date': 'date',
  'dated': 'date',

  // amount
  'transaction amount': 'amount',
  'txn amount': 'amount',
  'amount (inr)': 'amount',
  'amount(inr)': 'amount',
  'debit': 'amount',
  'credit': 'amount',
  'withdrawal': 'amount',
  'deposit': 'amount',
  'debit amount': 'amount',
  'credit amount': 'amount',
  'withdrawal amount': 'amount',
  'withdrawal amt.': 'amount',
  'deposit amount': 'amount',
  'deposit amt.': 'amount',
  'price': 'amount',
  'cost': 'amount',
  'value': 'amount',
  'total': 'amount',

  // description
  'narration': 'description',
  'particulars': 'description',
  'details': 'description',
  'transaction details': 'description',
  'trans description': 'description',
  'trans desc': 'description',
  'transaction description': 'description',
  'transaction_description': 'description',
  'merchant': 'description',
  'payee': 'description',
  'memo': 'description',
  'title': 'description',
  'name': 'description',
  'item': 'description',

  // category
  'category name': 'category',
  'category_name': 'category',
  'expense category': 'category',
  'expense type': 'category',

  // account
  'account name': 'account',
  'account_name': 'account',
  'source': 'account',
  'payment source': 'account',
  'bank': 'account',
  'wallet': 'account',

  // type
  'transaction type': 'type',
  'transaction_type': 'type',
  'dr/cr': 'type',
  'debit/credit': 'type',
  'income/expense': 'type',
  'expense/income': 'type',
  'txn type': 'type',

  // method
  'payment method': 'method',
  'payment_method': 'method',
  'payment mode': 'method',
  'payment_mode': 'method',
  'paid via': 'method',
  'paid through': 'method',
  'mode': 'method',
  'mode of payment': 'method',

  // notes
  'comment': 'notes',
  'comments': 'notes',
  'additional info': 'notes',
  'additional_info': 'notes',
  'remark': 'notes',
  'remarks': 'notes',
  'reference': 'notes',
  'ref': 'notes',
  'ref no': 'notes',
  'ref no.': 'notes',
}

export function normalizeHeader(raw: string): string {
  const trimmed = raw.trim().toLowerCase()
  return HEADER_ALIASES[trimmed] ?? trimmed
}

const DATE_FORMATS = [
  'yyyy-MM-dd',
  'dd/MM/yyyy',
  'MM/dd/yyyy',
  'dd-MM-yyyy',
  'MM-dd-yyyy',
  'd/M/yyyy',
  'M/d/yyyy',
  'dd/MM/yy',
  'MM/dd/yy',
  'dd MMM yyyy',
  'dd-MMM-yyyy',
  'MMM dd, yyyy',
  'MMM d, yyyy',
  'yyyy/MM/dd',
  'd MMM yyyy',
  'MMM-dd-yyyy',
]

export function normalizeDate(raw: string): Date | null {
  const cleaned = raw.trim()
  const ref = new Date()

  for (const fmt of DATE_FORMATS) {
    const parsed = parse(cleaned, fmt, ref)
    if (isValid(parsed)) return parsed
  }

  // Fallback: native Date (handles ISO with time, etc.)
  const native = new Date(cleaned)
  if (isValid(native) && !isNaN(native.getTime())) return native

  return null
}

export function normalizeAmount(raw: string | number): number | null {
  if (typeof raw === 'number') return isNaN(raw) ? null : Math.abs(raw)

  let cleaned = raw
    .replace(/[₹$€£¥]/g, '')
    .replace(/\b(rs\.?|inr)\b/gi, '')
    .replace(/,/g, '')
    .trim()

  // (100.00) → negative
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    cleaned = '-' + cleaned.slice(1, -1)
  }

  const num = parseFloat(cleaned)
  return isNaN(num) ? null : Math.abs(num)
}

const EXPENSE_KEYWORDS = new Set(['expense', 'debit', 'dr', 'd', 'withdrawal', 'withdraw', 'paid', 'spent', 'out'])
const INCOME_KEYWORDS = new Set(['income', 'credit', 'cr', 'c', 'deposit', 'received', 'in', 'refund', 'cashback'])

export function normalizeType(raw: string): 'EXPENSE' | 'INCOME' {
  const lower = raw.toLowerCase().trim()
  if (INCOME_KEYWORDS.has(lower)) return 'INCOME'
  if (EXPENSE_KEYWORDS.has(lower)) return 'EXPENSE'
  return 'EXPENSE'
}

const PAYMENT_METHOD_MAP: Record<string, string> = {
  cash: 'CASH',
  upi: 'UPI',
  gpay: 'UPI',
  googlepay: 'UPI',
  phonepay: 'UPI',
  paytm: 'UPI',
  bhim: 'UPI',
  card: 'CARD',
  debitcard: 'CARD',
  creditcard: 'CARD',
  debit: 'CARD',
  credit: 'CARD',
  'debit card': 'CARD',
  'credit card': 'CARD',
  neft: 'BANK_TRANSFER',
  imps: 'BANK_TRANSFER',
  rtgs: 'BANK_TRANSFER',
  'bank transfer': 'BANK_TRANSFER',
  'net banking': 'BANK_TRANSFER',
  netbanking: 'BANK_TRANSFER',
  transfer: 'BANK_TRANSFER',
  other: 'OTHER',
}

export function normalizePaymentMethod(raw: string): string {
  const lower = raw.toLowerCase().replace(/\s+/g, ' ').trim()
  return PAYMENT_METHOD_MAP[lower] ?? 'OTHER'
}

export function findClosestCategory(input: string, categories: string[]): string | null {
  const normalized = input.toLowerCase().trim()

  // Exact match
  const exact = categories.find(c => c.toLowerCase() === normalized)
  if (exact) return exact

  // Input is a substring of a category name or vice versa
  const partial = categories.find(
    c => c.toLowerCase().includes(normalized) || normalized.includes(c.toLowerCase())
  )
  if (partial) return partial

  return null
}
