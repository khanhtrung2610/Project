import { useState, useEffect } from "react";

const Inventory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((error) => console.error("Lỗi:", error));
  }, []);

  return (
    <div>
      <h2>Hoạt động kho</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Thời gian</th>
            <th>Thiết bị</th>
            <th>Số lượng</th>
            <th>Loại</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.time}</td>
              <td>{t.device}</td>
              <td>{t.quantity}</td>
              <td>{t.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
