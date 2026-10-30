const dashboardRepository = require("./dashboardRepository");

const getDashboardData = async (userId) => {
  const [totals, rawExpenseOverview, recentTransactions, accountsSummary] = await Promise.all([
    dashboardRepository.getTotalsAndCount(userId),
    dashboardRepository.getExpenseOverviewGrouped(userId),
    dashboardRepository.getRecentTransactions(userId, 5),
    dashboardRepository.getAccountsSummary(userId),
  ]);

  const totalIncome = Number(totals.total_income) || 0;
  const totalExpense = Number(totals.total_expense) || 0;
  const balance = totalIncome - totalExpense;
  const totalTransactions = Number(totals.total_transactions) || 0;

  const expenseOverview = rawExpenseOverview.map((item) => {
    const totalAmount = Number(item.totalAmount) || 0;
    const percentage = totalExpense > 0 ? Math.round((totalAmount / totalExpense) * 100) : 0;
    return {
      categoryName: item.categoryName,
      totalAmount,
      percentage,
    };
  });

  return {
    totalIncome,
    totalExpense,
    balance,
    totalTransactions,
    recentTransactions,
    expenseOverview,
    accountsSummary,
  };
};

module.exports = {
  getDashboardData,
};
