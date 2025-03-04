import { useDispatch, useSelector } from "react-redux";
import { removeToast } from "../redux/slices/toastSlice";

const MessageToast = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.toast.message);
  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1000 }}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="toast show"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div className={`toast-header bg-${msg.status} text-white`}>
            <strong className="me-auto">
              {msg.status === "success" ? "成功" : "錯誤"}
            </strong>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => dispatch(removeToast(msg.id))}
            ></button>
          </div>
          <div className="toast-body">{msg.text}</div>
        </div>
      ))}
    </div>
  );
};

export default MessageToast;
