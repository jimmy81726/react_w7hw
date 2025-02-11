import axios from "axios";
import { useEffect, useRef } from "react";
import { Modal } from "bootstrap";

const url = import.meta.env.VITE_BASE_URL;
const api_path = import.meta.env.VITE_API_PATH;
function ProductModal({
  mode,
  modalInstanceRef,
  getProducts,
  setTempProduct,
  tempProduct,
}) {
  const fileInputRef = useRef(null);
  const productModalRef = useRef(null);

  // 建立產品modal
  useEffect(() => {
    if (productModalRef.current) {
      modalInstanceRef.current = new Modal(productModalRef.current, {
        backdrop: "static",
      });
    }
  }, []);

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
      console.error("發生錯誤:", error);
      handleCloseProductModal();
    }
  };

  // 上傳圖片後更新主圖
  const handleImageUpload = async (e) => {
    const formData = new FormData();
    formData.append("file-to-upload", e.target.files[0]);
    try {
      const res = await axios.post(
        `${url}/v2/api/${api_path}/admin/upload`,
        formData
      );
      const uploadimage = res.data.imageUrl;
      setTempProduct({ ...tempProduct, imageUrl: uploadimage });
    } catch (error) {
      console.error("發生錯誤:", error);
    }
  };
  // 刪掉副圖的url欄位
  const delImagesUrls = () => {
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

  // 新增副圖的url欄位
  const addImagesUrls = () => {
    const newImages = [...tempProduct.imagesUrl, ""];
    setTempProduct({ ...tempProduct, imagesUrl: newImages });
  };

  // 新增副圖
  const handleimages = (e, index) => {
    const { value } = e.target;
    const newImages = [...tempProduct.imagesUrl];
    newImages[index] = value;
    setTempProduct({ ...tempProduct, imagesUrl: newImages });
    console.log("Updating imagesUrl:", newImages);
  };

  // 只要在表單打字都會觸發此動作
  const handleProduct = (e) => {
    const { value, name, checked, type } = e.target;
    setTempProduct({
      ...tempProduct,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  //關掉產品modal
  const handleCloseProductModal = () => {
    // 清空上傳圖片的欄位
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    modalInstanceRef.current.hide();
  };
  return (
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
                <div className="mb-5">
                  <label htmlFor="fileInput" className="form-label">
                    {" "}
                    圖片上傳{" "}
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="form-control"
                    id="fileInput"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                  />
                </div>
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
                          onClick={addImagesUrls}
                          className="btn btn-outline-primary btn-sm w-100"
                        >
                          新增圖片
                        </button>
                      )}
                    {/* 這邊用some判斷只要有值才跑出取消,不然用陣列長度判斷空值也是1,沒東西有取消鍵很奇怪 */}
                    {tempProduct.imagesUrl.some((url) => url !== "") && (
                      <button
                        onClick={delImagesUrls}
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
  );
}
export default ProductModal;
