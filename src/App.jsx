import { useEffect, useState } from "react";

import axios from "axios";
import LoginPages from "./pages/LoginPages";

import ProductPages from "./pages/ProductPages";

const url = import.meta.env.VITE_BASE_URL;
const api_path = import.meta.env.VITE_API_PATH;
// 記得env檔案要放在外層
function App() {
  const [isAuth, setAuth] = useState(false);
  // 成功登入改狀態,為了顯示首頁面用

  // 注意要寫表達式的話在checklogin前面因為會用到,寫成function就會提升
  async function getProducts(index = 1) {
    // 把存在cookie的token抓下來用,這個方法不知道為何不會抓token,只好在設定一次....待解決
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    axios.defaults.headers.common["Authorization"] = token;
    try {
      const res = await axios.get(
        `${url}/v2/api/${api_path}/admin/products?page=${index}`
      );
      // api來調用產品資料,已預設header,注意products/all取得的不是陣列不能.map
      setProducts(res.data.products);
      setPageInfo(res.data.pagination);

      // 更新狀態後再渲染一次,取得產品資料
    } catch (error) {
      console.error("發生錯誤:", error);
    }
  }

  //檢查登入狀態,然後在渲染就檢查,沒過期就可以登入
  const checkLogin = async () => {
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    // 第一次登入一定不會有token,避免跑錯誤log寫的
    if (!token) {
      console.log("沒有 Token，跳過 checkLogin");
      return;
    }
    try {
      await axios.post(`${url}/v2/api/user/check`);
      setAuth(true);
      // 當然是成功登入後再取得資料
      getProducts();
    } catch (error) {
      console.error("發生錯誤:", error);
    }
  };

  useEffect(() => {
    // 把存在cookie的token抓下來用
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    axios.defaults.headers.common["Authorization"] = token;

    // 把header要帶的token預設好
    checkLogin();
  }, []);

  const [pageInfo, setPageInfo] = useState("");
  const [products, setProducts] = useState([]);

  return (
    <>
      {isAuth ? (
        <ProductPages
          pageInfo={pageInfo}
          products={products}
          getProducts={getProducts}
        />
      ) : (
        <LoginPages
          setAuth={setAuth}
          getProducts={getProducts}
          isAuth={isAuth}
        />
      )}
    </>
  );
}

export default App;
