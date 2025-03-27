import { useState, useEffect } from "react";

const Payments = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/payments")
      .then((res) => res.json())
      .then((data) => setPayments(data))
      .catch((error) => console.error("Lỗi:", error));
  }, []);

  return (
    <div>
      <h2>Danh sách thanh toán</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th>Số tiền</th>
            <th>Ngày</th>
            <th>Phương thức</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.customer}</td>
              <td>{p.amount}</td>
              <td>{p.date}</td>
              <td>{p.method}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Payments;
