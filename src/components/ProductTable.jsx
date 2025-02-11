function ProductTable({
  handleOpenProductModal,
  products,
  handleOpenDeleteModal,
  defaultModalState,
}) {
  return (
    <div className="row">
      <div className="col">
        <div className="d-flex justify-content-between">
          <h2>產品列表</h2>
          <button
            type="button"
            onClick={() => handleOpenProductModal(defaultModalState, "create")}
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
                  {product.is_enabled ? (
                    <p className="text-warning">啟用</p>
                  ) : (
                    <p className="text-secondary">未啟用</p>
                  )}
                </td>
                <td>
                  <div className="btn-group">
                    <button
                      onClick={() => handleOpenProductModal(product, "edit")}
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
  );
}

export default ProductTable;
