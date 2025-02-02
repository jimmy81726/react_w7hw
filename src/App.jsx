import { useEffect, useState, useRef } from "react";
import { Modal } from "bootstrap";

import axios from "axios";

const url = import.meta.env.VITE_BASE_URL;
const api_path = import.meta.env.VITE_API_PATH;
// 記得env檔案要放在外層
function App() {
  const [account, setAccount] = useState({
    username: "",
    password: "",
  });
  const defaultModalState = {
    imageUrl: "",
    title: "",
    category: "",
    unit: "",
    origin_price: "",
    price: "",
    description: "",
    content: "",
    is_enabled: 0,
    imagesUrl: [""],
  };
  // 副圖

  const [isAuth, setAuth] = useState(false);
  // 成功登入改狀態,為了顯示首頁面用
  const [products, setProducts] = useState([]);
  // 取得所有資料用
  const [tempProduct, setTempProduct] = useState(defaultModalState);
  //點所選target的產品

  // 設定標題內容,新增還編輯
  const [mode, setMode] = useState("");

  const productModalRef = useRef(null);
  const modalInstanceRef = useRef(null);
  const deleteModalRef = useRef(null);
  const deleteModalInstanceRef = useRef(null);

  // 建立產品modal
  useEffect(() => {
    modalInstanceRef.current = new Modal(productModalRef.current, {
      backdrop: "static",
    });
  }, []);

  // 建立刪除modal
  useEffect(() => {
    deleteModalInstanceRef.current = new Modal(deleteModalRef.current, {
      backdrop: "static",
    });
  }, []);

  // 只要在表單打字都會觸發此動作
  const handleProduct = (e) => {
    const { value, name, checked, type } = e.target;
    setTempProduct({
      ...tempProduct,
      [name]: type === "checkbox" ? checked : value,
    });
    console.log(tempProduct);
  };
  // 打開產品modal
  const handleOpenProductModal = (product, mode) => {
    setMode(mode);
    setTempProduct(product);
    // 打開當下先渲染一次,"建立新產品"那邊傳default,從"編輯按鈕"那邊打開傳當下的產品
    modalInstanceRef.current.show();
  };
  //關掉產品modal
  const handleCloseProductModal = () => {
    modalInstanceRef.current.hide();
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
  // 打開刪除的modal
  const handleOpenDeleteModal = (product) => {
    setTempProduct(product);
    // 打開刪除modal的時候,要顯示當下的那個產品title,所以需要再刷新一次
    deleteModalInstanceRef.current.show();
  };

  const handleCloseDeleteModal = () => {
    deleteModalInstanceRef.current.hide();
  };
  // 送出登入表單
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${url}/v2/admin/signin`, account);
      setAuth(true);
      // 登入成功後改狀態再依條件渲染
      const { expired, token } = res.data;
      document.cookie = `token=${token}; expires=${new Date(expired)}`;
      // 將登入成功的臨時身分證存起來給別的方法用
      axios.defaults.headers.common["Authorization"] = token;
      // 把header給預設好
      getProducts();
      // 當然是成功登入後再取得資料
    } catch (error) {
      alert("登入失敗囉!");
      console.dir(error);
    }
  };
  // 首頁產品顯示
  const getProducts = async () => {
    try {
      const res = await axios.get(`${url}/v2/api/${api_path}/admin/products/`);
      // api來調用產品資料,已預設header,注意products/all取得的不是陣列不能.map
      setProducts(res.data.products);
      // 更新狀態後再渲染一次,取得產品資料
    } catch (error) {}
  };
  // 新增/編輯產品
  const updateProduct = async () => {
    try {
      const method = mode === "edit" ? "put" : "post";
      const urlPath =
        mode === "edit"
          ? `${url}/v2/api/${api_path}/admin/product/${tempProduct.id}`
          : `${url}/v2/api/${api_path}/admin/product/`;
      await axios({
        method: method,
        url: urlPath,
        data: {
          data: {
            ...tempProduct,
            origin_price: Number(tempProduct.origin_price),
            price: Number(tempProduct.price),
            is_enabled: tempProduct.is_enabled ? 1 : 0,
            // 要注意api格式,請非常注意卡很久...
          },
        },
      });
      getProducts();
      handleCloseProductModal();
    } catch (error) {
      alert("新增失敗");
      handleCloseProductModal();
    }
  };
  // 刪除產品
  const delProduct = async () => {
    try {
      await axios.delete(
        `${url}/v2/api/${api_path}/admin/product/${tempProduct.id}`
      );
      getProducts();
      handleCloseDeleteModal();
    } catch (error) {
      alert("刪除失敗");
    }
  };

  const handleimages = (e, index) => {
    const { value } = e.target;
    const newImages = [...tempProduct.imagesUrl];
    newImages[index] = value;
    setTempProduct({ ...tempProduct, imagesUrl: newImages });
    console.log("Updating imagesUrl:", newImages);
  };

  const addImages = () => {
    const newImages = [...tempProduct.imagesUrl, ""];
    setTempProduct({ ...tempProduct, imagesUrl: newImages });
  };

  const delImages = () => {
    if (tempProduct.imagesUrl.length >= 1) {
      const newImages = [...tempProduct.imagesUrl];
      newImages.pop(); // 移除最後一個圖片網址
      if (newImages.length === 0) {
        newImages.push(""); // 保證至少有一個空字串
      }
      setTempProduct({ ...tempProduct, imagesUrl: newImages });
    }
  };
  // 修改不能直接對tempProduct,應該要複製一份改好在覆蓋上去,setState就是覆蓋上新的

  return (
    <>
      {isAuth ? (
        <div className="container py-5">
          <div className="row">
            <div className="col">
              <div className="d-flex justify-content-between">
                <h2>產品列表</h2>
                <button
                  type="button"
                  onClick={() =>
                    handleOpenProductModal(defaultModalState, "create")
                  }
                  className="btn btn-primary "
                >
                  建立新的產品
                </button>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <th scope="row">{product.title}</th>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>
                        {product.is_enabled ? <p>啟用</p> : <p>未啟用</p>}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            onClick={() =>
                              handleOpenProductModal(product, "edit")
                            }
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(product)}
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
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
      )}
      <div
        ref={productModalRef}
        className="modal"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom">
              <h5 className="modal-title fs-4">
                {mode === "edit" ? "編輯產品" : "新增產品"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseProductModal}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body p-4">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="mb-4">
                    <label htmlFor="primary-image" className="form-label">
                      主圖
                    </label>
                    <div className="input-group">
                      <input
                        value={tempProduct.imageUrl}
                        onChange={handleProduct}
                        name="imageUrl"
                        type="text"
                        id="primary-image"
                        className="form-control"
                        placeholder="請輸入圖片連結"
                      />
                    </div>
                    <img
                      src={tempProduct.imageUrl}
                      alt="主圖"
                      className="img-fluid"
                    />
                  </div>

                  {/* 副圖 */}
                  <div className="border border-2 border-dashed rounded-3 p-3">
                    {tempProduct.imagesUrl?.map((image, index) => (
                      <div key={index} className="mb-2">
                        <label
                          htmlFor={`imagesUrl-${index + 1}`}
                          className="form-label"
                        >
                          副圖 {index + 1}
                        </label>
                        <input
                          value={image}
                          onChange={(e) => handleimages(e, index)}
                          id={`imagesUrl-${index + 1}`}
                          type="text"
                          placeholder={`圖片網址 ${index + 1}`}
                          className="form-control mb-2"
                        />
                        {image && (
                          <img
                            src={image}
                            alt={`副圖 ${index + 1}`}
                            className="img-fluid mb-2"
                          />
                        )}
                      </div>
                    ))}
                    <div className="btn-group w-100">
                      {tempProduct.imagesUrl.length < 5 &&
                        tempProduct.imagesUrl[
                          tempProduct.imagesUrl.length - 1
                        ] !== "" && (
                          <button
                            onClick={addImages}
                            className="btn btn-outline-primary btn-sm w-100"
                          >
                            新增圖片
                          </button>
                        )}
                      {/* 這邊用some判斷只要有值才跑出取消,不然用陣列長度判斷空值也是1,沒東西有取消鍵很奇怪 */}
                      {tempProduct.imagesUrl.some((url) => url !== "") && (
                        <button
                          onClick={delImages}
                          className="btn btn-outline-danger btn-sm w-100"
                        >
                          取消圖片
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      標題
                    </label>
                    <input
                      value={tempProduct.title}
                      onChange={handleProduct}
                      name="title"
                      id="title"
                      type="text"
                      className="form-control"
                      placeholder="請輸入標題"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      分類
                    </label>
                    <input
                      value={tempProduct.category}
                      onChange={handleProduct}
                      name="category"
                      id="category"
                      type="text"
                      className="form-control"
                      placeholder="請輸入分類"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">
                      單位
                    </label>
                    <input
                      value={tempProduct.unit}
                      onChange={handleProduct}
                      name="unit"
                      id="unit"
                      type="text"
                      className="form-control"
                      placeholder="請輸入單位"
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label htmlFor="origin_price" className="form-label">
                        原價
                      </label>
                      <input
                        value={tempProduct.origin_price}
                        onChange={handleProduct}
                        name="origin_price"
                        id="origin_price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入原價"
                      />
                    </div>
                    <div className="col-6">
                      <label htmlFor="price" className="form-label">
                        售價
                      </label>
                      <input
                        value={tempProduct.price}
                        onChange={handleProduct}
                        name="price"
                        id="price"
                        type="number"
                        className="form-control"
                        placeholder="請輸入售價"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      產品描述
                    </label>
                    <textarea
                      value={tempProduct.description}
                      onChange={handleProduct}
                      name="description"
                      id="description"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入產品描述"
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">
                      說明內容
                    </label>
                    <textarea
                      value={tempProduct.content}
                      onChange={handleProduct}
                      name="content"
                      id="content"
                      className="form-control"
                      rows={4}
                      placeholder="請輸入說明內容"
                    ></textarea>
                  </div>

                  <div className="form-check">
                    <input
                      checked={tempProduct.is_enabled}
                      // checkbox不能用value
                      onChange={handleProduct}
                      name="is_enabled"
                      type="checkbox"
                      className="form-check-input"
                      id="isEnabled"
                    />
                    <label className="form-check-label" htmlFor="isEnabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top bg-light">
              <button
                type="button"
                onClick={handleCloseProductModal}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={updateProduct}
                className="btn btn-primary"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        ref={deleteModalRef}
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                type="button"
                onClick={delProduct}
                className="btn btn-danger"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
