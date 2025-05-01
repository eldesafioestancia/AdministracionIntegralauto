import { Link } from "wouter";
import { format } from "date-fns";

interface Transaction {
  id: number;
  concept: string;
  type: "income" | "expense";
  category: string;
  date: Date;
  amount: number;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <h2 className="font-header font-semibold text-neutral-500">Transacciones Recientes</h2>
        <Link href="/finances">
          <a className="text-sm text-accent hover:text-accent-dark">Ver todas</a>
        </Link>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-500">
                    {transaction.concept}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === "income"
                          ? "bg-success bg-opacity-10 text-success"
                          : "bg-destructive bg-opacity-10 text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "Ingreso" : "Gasto"}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-neutral-400">
                    {format(transaction.date, "dd/MM/yyyy")}
                  </td>
                  <td
                    className={`px-3 py-2 whitespace-nowrap text-sm ${
                      transaction.type === "income" ? "text-success" : "text-destructive"
                    } text-right`}
                  >
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
