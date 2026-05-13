import 'dotenv/config'
import { Contact, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const DEFAULT_CATEGORIES = [
  { name: 'Family', color: '#EF4444', isDefault: true },
  { name: 'Friends', color: '#F59E0B', isDefault: true },
  { name: 'Lifestyle', color: '#8B5CF6', isDefault: true },
  { name: 'Food', color: '#10B981', isDefault: true },
  { name: 'Transportation', color: '#3B82F6', isDefault: true },
  { name: 'Entertainment', color: '#EC4899', isDefault: true },
  { name: 'Shopping', color: '#F97316', isDefault: true },
  { name: 'Bills & Utilities', color: '#06B6D4', isDefault: true },
  { name: 'Healthcare', color: '#14B8A6', isDefault: true },
  { name: 'Education', color: '#6366F1', isDefault: true },
  { name: 'Other', color: '#6B7280', isDefault: true },
]

const getRandomDate = (startDate: Date, endDate: Date): Date => {
  const start = startDate.getTime()
  const end = endDate.getTime()
  return new Date(start + Math.random() * (end - start))
}

const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const main = async () => {
  console.log('Starting database seed...')

  // Create default categories
  console.log('\n📁 Creating default categories...')
  for (const category of DEFAULT_CATEGORIES) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: category.name,
        isDefault: true,
        userId: null,
      },
    })

    if (!existingCategory) {
      await prisma.category.create({
        data: category,
      })
      console.log(`✓ Created default category: ${category.name}`)
    } else {
      console.log(`- Category already exists: ${category.name}`)
    }
  }

  // Find the existing user
  console.log('\n👤 Finding existing user...')
  const user = await prisma.user.findFirst()

  if (!user) {
    console.log('❌ No user found. Please create a user first.')
    return
  }

  console.log(`✓ Found user: ${user.email}`)

  // Get categories for this user
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { userId: user.id },
        { isDefault: true, userId: null },
      ],
    },
  })

  // Create accounts
  console.log('\n💳 Creating accounts...')
  const accounts = []

  const accountsData = [
    { name: 'Cash', type: 'CASH' as const, initialBalance: 15000, currency: 'INR' },
    { name: 'HDFC Savings', type: 'SAVINGS' as const, initialBalance: 85000, currency: 'INR' },
    { name: 'Credit Card', type: 'CREDIT_CARD' as const, initialBalance: 0, currency: 'INR' },
    { name: 'SBI Current', type: 'CURRENT' as const, initialBalance: 45000, currency: 'INR' },
  ]

  for (const accountData of accountsData) {
    const existing = await prisma.account.findFirst({
      where: { name: accountData.name, userId: user.id },
    })

    if (!existing) {
      const account = await prisma.account.create({
        data: {
          ...accountData,
          userId: user.id,
        },
      })
      accounts.push(account)
      console.log(`✓ Created account: ${account.name}`)
    } else {
      accounts.push(existing)
      console.log(`- Account already exists: ${existing.name}`)
    }
  }

  // Create contacts
  console.log('\n👥 Creating contacts...')
  const contacts: Contact[] = []

  const contactsData = [
    { name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91-9876543210' },
    { name: 'Priya Sharma', email: 'priya@example.com', phone: '+91-9876543211' },
    { name: 'Amit Patel', email: 'amit@example.com', phone: '+91-9876543212' },
    { name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91-9876543213' },
    { name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91-9876543214' },
  ]

  for (const contactData of contactsData) {
    const existing = await prisma.contact.findFirst({
      where: { email: contactData.email, userId: user.id },
    })

    if (!existing) {
      const contact = await prisma.contact.create({
        data: {
          ...contactData,
          userId: user.id,
        },
      })
      contacts.push(contact)
      console.log(`✓ Created contact: ${contact.name}`)
    } else {
      contacts.push(existing)
      console.log(`- Contact already exists: ${existing.name}`)
    }
  }

  // Create expenses (last 6 months)
  console.log('\n💸 Creating expenses...')
  const today = new Date()
  const sixMonthsAgo = new Date(today)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const expenseTemplates = [
    { description: 'Grocery shopping', categoryName: 'Food', minAmount: 1500, maxAmount: 4000, type: 'EXPENSE' as const },
    { description: 'Restaurant dinner', categoryName: 'Food', minAmount: 800, maxAmount: 2500, type: 'EXPENSE' as const },
    { description: 'Uber ride', categoryName: 'Transportation', minAmount: 150, maxAmount: 500, type: 'EXPENSE' as const },
    { description: 'Movie tickets', categoryName: 'Entertainment', minAmount: 400, maxAmount: 1000, type: 'EXPENSE' as const },
    { description: 'Electricity bill', categoryName: 'Bills & Utilities', minAmount: 2000, maxAmount: 4000, type: 'EXPENSE' as const },
    { description: 'Online shopping', categoryName: 'Shopping', minAmount: 1000, maxAmount: 5000, type: 'EXPENSE' as const },
    { description: 'Doctor visit', categoryName: 'Healthcare', minAmount: 500, maxAmount: 2000, type: 'EXPENSE' as const },
    { description: 'Petrol', categoryName: 'Transportation', minAmount: 1000, maxAmount: 3000, type: 'EXPENSE' as const },
    { description: 'Coffee with friends', categoryName: 'Friends', minAmount: 200, maxAmount: 600, type: 'EXPENSE' as const },
    { description: 'Salary', categoryName: 'Other', minAmount: 50000, maxAmount: 80000, type: 'INCOME' as const },
    { description: 'Freelance project', categoryName: 'Other', minAmount: 10000, maxAmount: 25000, type: 'INCOME' as const },
    { description: 'Gift from family', categoryName: 'Family', minAmount: 5000, maxAmount: 15000, type: 'INCOME' as const },
  ]

  let expenseCount = 0

  // Create 50-80 expenses spread across 6 months
  const numExpenses = Math.floor(Math.random() * 30) + 50

  for (let i = 0; i < numExpenses; i++) {
    const template = getRandomItem(expenseTemplates)
    const category = categories.find((c) => c.name === template.categoryName)
    const account = getRandomItem(accounts)
    const amount = Math.floor(Math.random() * (template.maxAmount - template.minAmount)) + template.minAmount
    const date = getRandomDate(sixMonthsAgo, today)

    await prisma.expense.create({
      data: {
        description: template.description,
        amount,
        date,
        type: template.type,
        paymentMethod: getRandomItem(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER']),
        userId: user.id,
        categoryId: category!.id,
        accountId: account.id,
      },
    })
    expenseCount++
  }

  console.log(`✓ Created ${expenseCount} expenses`)

  // Create budgets
  console.log('\n🎯 Creating budgets...')
  const budgetsData = [
    { categoryName: 'Food', amount: 15000, period: 'MONTHLY' },
    { categoryName: 'Transportation', amount: 8000, period: 'MONTHLY' },
    { categoryName: 'Entertainment', amount: 5000, period: 'MONTHLY' },
    { categoryName: 'Shopping', amount: 10000, period: 'MONTHLY' },
  ]

  for (const budgetData of budgetsData) {
    const category = categories.find((c) => c.name === budgetData.categoryName)
    if (!category) continue

    const existing = await prisma.budget.findFirst({
      where: { categoryId: category.id, userId: user.id },
    })

    if (!existing) {
      await prisma.budget.create({
        data: {
          amount: budgetData.amount,
          period: budgetData.period,
          startDate: new Date(today.getFullYear(), today.getMonth(), 1),
          userId: user.id,
          categoryId: category.id,
        },
      })
      console.log(`✓ Created budget for ${budgetData.categoryName}`)
    } else {
      console.log(`- Budget already exists for ${budgetData.categoryName}`)
    }
  }

  // Create recurring expenses
  console.log('\n🔄 Creating recurring expenses...')
  const recurringData = [
    { description: 'Netflix Subscription', categoryName: 'Entertainment', amount: 649, frequency: 'MONTHLY' as const, dayOfMonth: 5 },
    { description: 'Gym Membership', categoryName: 'Lifestyle', amount: 1500, frequency: 'MONTHLY' as const, dayOfMonth: 1 },
    { description: 'Internet Bill', categoryName: 'Bills & Utilities', amount: 999, frequency: 'MONTHLY' as const, dayOfMonth: 10 },
    { description: 'Spotify Premium', categoryName: 'Entertainment', amount: 119, frequency: 'MONTHLY' as const, dayOfMonth: 15 },
    { description: 'House Rent', categoryName: 'Lifestyle', amount: 25000, frequency: 'MONTHLY' as const, dayOfMonth: 1 },
  ]

  for (const recurringItem of recurringData) {
    const category = categories.find((c) => c.name === recurringItem.categoryName)
    const account = accounts[0]
    if (!category) continue

    const existing = await prisma.recurringExpense.findFirst({
      where: { description: recurringItem.description, userId: user.id },
    })

    if (!existing) {
      const nextDate = new Date(today.getFullYear(), today.getMonth(), recurringItem.dayOfMonth)
      if (nextDate < today) {
        nextDate.setMonth(nextDate.getMonth() + 1)
      }

      await prisma.recurringExpense.create({
        data: {
          description: recurringItem.description,
          amount: recurringItem.amount,
          frequency: recurringItem.frequency,
          startDate: new Date(today.getFullYear(), today.getMonth() - 3, recurringItem.dayOfMonth),
          nextDate,
          isActive: true,
          type: 'EXPENSE',
          userId: user.id,
          categoryId: category.id,
          accountId: account.id,
        },
      })
      console.log(`✓ Created recurring expense: ${recurringItem.description}`)
    } else {
      console.log(`- Recurring expense already exists: ${recurringItem.description}`)
    }
  }

  // Create groups
  console.log('\n👨‍👩‍👧‍👦 Creating groups...')
  const groupsData = [
    { name: 'Goa Trip 2026', description: 'Friends trip to Goa', members: [0, 1, 2] },
    { name: 'Office Lunch', description: 'Weekly office lunch expenses', members: [1, 3] },
    { name: 'Apartment Maintenance', description: 'Monthly apartment expenses', members: [0, 2, 4] },
  ]

  for (const groupData of groupsData) {
    const existing = await prisma.group.findFirst({
      where: {
        name: groupData.name,
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    })

    if (!existing) {
      const group = await prisma.group.create({
        data: {
          name: groupData.name,
          description: groupData.description,
          members: {
            create: [
              { userId: user.id, role: 'admin' },
              ...groupData.members.map((idx) => ({
                contactId: contacts[idx].id,
                role: 'member',
              })),
            ],
          },
        },
      })

      // Create some group expenses
      const groupCategory = getRandomItem(categories)
      const groupAccount = getRandomItem(accounts)

      for (let i = 0; i < 3; i++) {
        const expenseAmount = Math.floor(Math.random() * 5000) + 1000
        const expense = await prisma.expense.create({
          data: {
            description: `${groupData.name} - Expense ${i + 1}`,
            amount: expenseAmount,
            date: getRandomDate(sixMonthsAgo, today),
            type: 'EXPENSE',
            paymentMethod: 'UPI',
            userId: user.id,
            categoryId: groupCategory.id,
            accountId: groupAccount.id,
            groupId: group.id,
          },
        })

        // Create expense participants (splits)
        const splitAmount = Math.floor(expenseAmount / (groupData.members.length + 1))

        // User as payer
        await prisma.expenseParticipant.create({
          data: {
            expenseId: expense.id,
            userId: user.id,
            paidAmount: expenseAmount,
            splitType: 'EQUAL',
            splitValue: splitAmount,
            oweAmount: splitAmount,
          },
        })

        // Contacts as participants
        for (const idx of groupData.members) {
          await prisma.expenseParticipant.create({
            data: {
              expenseId: expense.id,
              contactId: contacts[idx].id,
              paidAmount: 0,
              splitType: 'EQUAL',
              splitValue: splitAmount,
              oweAmount: splitAmount,
            },
          })
        }
      }

      console.log(`✓ Created group: ${group.name} with expenses`)
    } else {
      console.log(`- Group already exists: ${groupData.name}`)
    }
  }

  // Create some settlements
  console.log('\n💰 Creating settlements...')
  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    include: { members: true },
  })

  for (const group of groups) {
    const contactMembers = group.members.filter((m) => m.contactId !== null)
    if (contactMembers.length === 0) continue

    const member = getRandomItem(contactMembers)
    const settlementAmount = Math.floor(Math.random() * 2000) + 500

    const existing = await prisma.settlement.findFirst({
      where: {
        groupId: group.id,
        payerContactId: member.contactId!,
      },
    })

    if (!existing) {
      await prisma.settlement.create({
        data: {
          amount: settlementAmount,
          date: getRandomDate(sixMonthsAgo, today),
          groupId: group.id,
          receiverUserId: user.id,
          payerContactId: member.contactId!,
        },
      })
      console.log(`✓ Created settlement for group: ${group.name}`)
    }
  }

  console.log('\n✅ Database seed completed successfully! 🌱')
  console.log(`
📊 Summary:
  - Categories: ${categories.length}
  - Accounts: ${accounts.length}
  - Contacts: ${contacts.length}
  - Expenses: ${expenseCount}
  - Budgets: ${budgetsData.length}
  - Recurring Expenses: ${recurringData.length}
  - Groups: ${groupsData.length}
  `)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
