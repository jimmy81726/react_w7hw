import { useState, useRef } from "react";

import ProductTable from "../components/ProductTable";
import Pagination from "../components/Pagination";
import ProductModal from "../components/ProductModal";
import DeleteModal from "../components/DeleteModal";

function ProductPages({ pageInfo, products, getProducts }) {
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

  const [tempProduct, setTempProduct] = useState(defaultModalState);
  //點所選target的產品

  const [mode, setMode] = useState("");

  const modalInstanceRef = useRef(null);
  const deleteModalInstanceRef = useRef(null);

  // 打開產品modal
  const handleOpenProductModal = (product, mode) => {
    setMode(mode);
    setTempProduct(product);
    // 打開當下先渲染一次,"建立新產品"那邊傳default,從"編輯按鈕"那邊打開傳當下的產品
    modalInstanceRef.current.show();
  };
  // 打開刪除的modal
  const handleOpenDeleteModal = (product) => {
    setTempProduct(product);
    // 打開刪除modal的時候,要顯示當下的那個產品title,所以需要再刷新一次
    deleteModalInstanceRef.current.show();
  };
  return (
    <div className="container py-5">
      <ProductTable
        handleOpenProductModal={handleOpenProductModal}
        handleOpenDeleteModal={handleOpenDeleteModal}
        products={products}
        defaultModalState={defaultModalState}
      />
      <Pagination pageInfo={pageInfo} getProducts={getProducts} />
      <ProductModal
        getProducts={getProducts}
        mode={mode}
        modalInstanceRef={modalInstanceRef}
        tempProduct={tempProduct}
        setTempProduct={setTempProduct}
      />
      <DeleteModal
        getProducts={getProducts}
        tempProduct={tempProduct}
        deleteModalInstanceRef={deleteModalInstanceRef}
      />
    </div>
  );
}

export default ProductPages;
