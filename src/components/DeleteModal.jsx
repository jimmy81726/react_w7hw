import axios from "axios";
import { useEffect, useRef } from "react";
import { Modal } from "bootstrap";
import { useDispatch } from "react-redux";
import { addToast } from "../redux/slices/toastSlice";

const url = import.meta.env.VITE_BASE_URL;
const api_path = import.meta.env.VITE_API_PATH;

function DeleteModal({ deleteModalInstanceRef, tempProduct, getProducts }) {
  const deleteModalRef = useRef(null);
  const dispatch = useDispatch();
  // 建立刪除modal
  useEffect(() => {
    if (deleteModalRef.current) {
      deleteModalInstanceRef.current = new Modal(deleteModalRef.current);
    }
  }, []);

  const handleCloseDeleteModal = () => {
    deleteModalInstanceRef.current.hide();
  };

  // 刪除產品
  const delProduct = async () => {
    try {
      await axios.delete(
        `${url}/v2/api/${api_path}/admin/product/${tempProduct.id}`
      );
      dispatch(addToast({ text: "刪除成功", status: "success" }));
      getProducts();
      handleCloseDeleteModal();
    } catch (error) {
      dispatch(addToast({ text: "刪除失敗", status: "error" }));
      console.error("發生錯誤:", error);
    }
  };

  return (
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
  );
}
export default DeleteModal;
