const NotificationIndecatorModal = ({
  title,
  message,
  type,
}: {
  title: string;
  message: string;
  type: string;
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <h2 style={{ color: type === "success" ? "green" : "red" }}>{title}</h2>
      <p>{message}</p>
      <button style={{ color: type === "success" ? "green" : "red" }}>
        {type}
      </button>
    </div>
  );
};

export default NotificationIndecatorModal;
