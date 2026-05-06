import type { GroupBalance } from '../types'

type SimplifiedDebt = {
  from: string
  fromName: string
  to: string
  toName: string
  amount: number
}

export const simplifyDebts = (balances: GroupBalance[]): SimplifiedDebt[] => {
  const creditors: { memberId: string; name: string; amount: number }[] = []
  const debtors: { memberId: string; name: string; amount: number }[] = []

  balances.forEach((balance) => {
    if (balance.netBalance > 0.01) {
      creditors.push({
        memberId: balance.memberId,
        name: balance.memberName,
        amount: balance.netBalance,
      })
    } else if (balance.netBalance < -0.01) {
      debtors.push({
        memberId: balance.memberId,
        name: balance.memberName,
        amount: -balance.netBalance,
      })
    }
  })

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const simplifiedDebts: SimplifiedDebt[] = []
  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci]
    const debtor = debtors[di]
    
    const amount = Math.min(creditor.amount, debtor.amount)

    if (amount > 0.01) {
      simplifiedDebts.push({
        from: debtor.memberId,
        fromName: debtor.name,
        to: creditor.memberId,
        toName: creditor.name,
        amount,
      })
    }

    creditor.amount -= amount
    debtor.amount -= amount

    if (creditor.amount < 0.01) ci++
    if (debtor.amount < 0.01) di++
  }

  return simplifiedDebts
}
