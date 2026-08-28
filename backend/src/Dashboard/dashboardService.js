const dashboardRepository = require("./dashboardRepository");

const getDashboardData = async () => {
  const [totals, rawExpenseOverview, recentTransactions] = await Promise.all([
    dashboardRepository.getTotalsAndCount(),
    dashboardRepository.getExpenseOverviewGrouped(),
    dashboardRepository.getRecentTransactions(5),
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
  };
};

module.exports = {
  getDashboardData,
};
