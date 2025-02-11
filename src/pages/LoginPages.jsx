import { useState } from "react";

import axios from "axios";

function LoginPages({ getProducts, setAuth }) {
  const url = import.meta.env.VITE_BASE_URL;
  const [account, setAccount] = useState({
    username: "",
    password: "",
  });
  // 送出登入表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/v2/admin/signin`, account);
      setAuth(true);
      // 登入成功後改狀態再依條件渲染
      const { expired, token } = res.data;
      document.cookie = `token=${token}; expires=${new Date(expired)}`;
      // 將登入成功的臨時身分證存起來給別的方法用把token存到cookies
      getProducts();
    } catch (error) {
      alert("登入失敗囉!");
      console.dir(error);
    }
  };

  // 輸入帳號密碼
  const handleKeyin = (e) => {
    const { id, value } = e.target;
    setAccount((data) => ({
      ...data,
      // 一定要展開式不然會整個蓋過去而不是更改
      [id]: value,
    }));
  };
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="mb-5">請先登入</h1>
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
        <div className="form-floating mb-3">
          <input
            value={account.username}
            type="email"
            className="form-control"
            id="username"
            placeholder="name@example.com"
            onChange={handleKeyin}
          />
          <label htmlFor="username">Email address</label>
        </div>
        <div className="form-floating">
          <input
            value={account.password}
            type="password"
            className="form-control"
            id="password"
            placeholder="Password"
            onChange={handleKeyin}
          />
          <label htmlFor="password">Password</label>
        </div>
        <button type="submit" className="btn btn-primary">
          登入
        </button>
      </form>
      <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
    </div>
  );
}

export default LoginPages;
