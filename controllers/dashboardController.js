const db = require("../db");

exports.getSummary = (req, res) => {
  // Aggregate totals for top-level KPI cards.
  const totalsQuery = `
    SELECT
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) AS totalIncome,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS totalExpense
    FROM records
  `;

  const categoryQuery = `
    SELECT category, COALESCE(SUM(amount), 0) AS total
    FROM records
    GROUP BY category
    ORDER BY total DESC
  `;

  const recentQuery = `
    SELECT id, amount, type, category, date, notes, user_id
    FROM records
    ORDER BY date DESC, id DESC
    LIMIT 5
  `;

  const monthlyTrendQuery = `
    SELECT substr(date, 1, 7) AS month,
           COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END), 0) AS income,
           COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS expense
    FROM records
    GROUP BY substr(date, 1, 7)
    ORDER BY month DESC
    LIMIT 6
  `;

  db.get(totalsQuery, [], (totalsErr, totals) => {
    if (totalsErr) return res.status(500).json({ error: totalsErr.message });

    // Run dependent summary queries and combine into one payload.
    db.all(categoryQuery, [], (categoryErr, categoryRows) => {
      if (categoryErr) return res.status(500).json({ error: categoryErr.message });

      db.all(recentQuery, [], (recentErr, recentRows) => {
        if (recentErr) return res.status(500).json({ error: recentErr.message });

        db.all(monthlyTrendQuery, [], (trendErr, trendRows) => {
          if (trendErr) return res.status(500).json({ error: trendErr.message });

          const totalIncome = Number(totals.totalIncome || 0);
          const totalExpense = Number(totals.totalExpense || 0);

          return res.json({
            totalIncome,
            totalExpense,
            netBalance: totalIncome - totalExpense,
            categoryTotals: categoryRows.map((row) => ({
              category: row.category,
              total: Number(row.total || 0)
            })),
            recentActivity: recentRows,
            monthlyTrends: trendRows.map((row) => ({
              month: row.month,
              income: Number(row.income || 0),
              expense: Number(row.expense || 0),
              net: Number(row.income || 0) - Number(row.expense || 0)
            }))
          });
        });
      });
    });
  });
};
