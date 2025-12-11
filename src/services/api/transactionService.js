import transactionsData from "@/services/mockData/transactions.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for transactions
let transactions = [...transactionsData];

export const transactionService = {
  async getAll() {
    await delay(300);
    return [...transactions];
  },

  async getById(id) {
    await delay(200);
    const transaction = transactions.find(t => t.Id === parseInt(id));
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return { ...transaction };
  },

  async create(transactionData) {
    await delay(400);
    const newId = Math.max(...transactions.map(t => t.Id)) + 1;
    const newTransaction = {
      Id: newId,
...transactionData,
      propertyStatus: transactionData.propertyStatus || "Pending - purchase",
      status: "New",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0]
    };
    transactions.push(newTransaction);
    return { ...newTransaction };
  },

  async update(id, updateData) {
    await delay(300);
    const index = transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    transactions[index] = {
      ...transactions[index],
...updateData,
      updatedAt: new Date().toISOString().split("T")[0]
    };
    return { ...transactions[index] };
  },

  async delete(id) {
    await delay(250);
    const index = transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    transactions.splice(index, 1);
    return true;
  },

  async getStats() {
    await delay(200);
    const stats = {
totalActive: transactions.filter(t => t.status !== "Completed").length,
      closingThisMonth: transactions.filter(t => {
        const closingDate = new Date(t.estimatedClosingDate);
        const now = new Date();
        return closingDate.getMonth() === now.getMonth() && 
               closingDate.getFullYear() === now.getFullYear() &&
               t.status !== "Completed";
      }).length,
      completedThisMonth: transactions.filter(t => {
        const updatedDate = new Date(t.updatedAt);
        const now = new Date();
        return updatedDate.getMonth() === now.getMonth() && 
               updatedDate.getFullYear() === now.getFullYear() &&
               t.status === "Completed";
      }).length,
      byStatus: transactions.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {})
    };
    return stats;
  }
};