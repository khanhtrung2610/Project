import { useState, useEffect } from "react";

const Categories = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/devices")
      .then((res) => res.json())
      .then((data) => {
        console.log("Dữ liệu thiết bị:", data);
        setDevices(data);
      })
      .catch((error) => console.error("Lỗi khi gọi API devices:", error));
  }, []);
  

  return (
    <div>
      <h2>Danh sách thiết bị</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên thiết bị</th>
            <th>Số lượng</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.id}>
              <td>{device.id}</td>
              <td>{device.name}</td>
              <td>{device.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Categories;
