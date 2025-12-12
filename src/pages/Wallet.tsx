import type { ChangeEvent } from "react";
import { useState, useEffect } from "react";
import ApiService from "../services/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import ServiceManHeader from "../components/ServiceManHeader";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

interface WalletResponse {
  data: {
    wallet_balance: number;
  };
}

const Wallet: React.FC = () => {
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [totalWalletBalance, setTotalWalletBalance] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Section loaders
  const walletLoader = useSectionLoader("wallet-balance");
  const withdrawLoader = useSectionLoader("withdraw-history");

  // Fetch Wallet Balance
  const getTotalWalletBalance = () => {
    walletLoader.setLoading(true);

    ApiService.get<WalletResponse>("/servicemen/getTotalWalletBalance")
      .then((res) => {
        setTotalWalletBalance(res.data.wallet_balance);
      })
      .catch((err) => {
        console.error("Error fetching wallet balance:", err);
      })
      .finally(() => walletLoader.setLoading(false));
  };

  // Fetch Withdrawal History
  const listWithdrawalHistory = () => {
    withdrawLoader.setLoading(true);

    ApiService.post("/servicemen/listWithdrawalHistory", {})
      .then((res: any) => {
        setWithdrawalHistory(res.data.list);
      })
      .catch((err) => {
        console.error("Error fetching withdrawal history:", err);
      })
      .finally(() => withdrawLoader.setLoading(false));
  };

  // Handle Withdraw
  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (amount > totalWalletBalance) return toast.error("Insufficient balance");

    setLoading(true);

    ApiService.post("/servicemen/requestWithdrawal", { amount })
      .then((res: any) => {
        toast.success(res.data.message);
        setIsModalOpen(false);
        setWithdrawAmount("");
        getTotalWalletBalance();
        listWithdrawalHistory();
      })
      .catch((err) => {
        console.error("Error withdrawing:", err);
        toast.error(err.response?.data?.message || "Something went wrong");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getTotalWalletBalance();
    listWithdrawalHistory();
  }, []);

  return (
    <>
      <ServiceManHeader title="My Wallet" />

      <div className="container main-content-service">
        
          {/* Wallet Balance */}
          <div className="row px-2">
            <div className="col-12 pt-2">
              <div className="wallet-balance-card">
                <p className="font-14 color-grey mb-2">Wallet Balance</p>

                {walletLoader.loading ? (
                  <SectionLoader show size="medium" overlay={false} text="" />
                ) : (
                  <b className="wallet-balance-amount">₹{totalWalletBalance}</b>
                )}
              </div>

              <button className="fill mt-3" onClick={() => setIsModalOpen(true)}>
                Withdraw Amount
              </button>
            </div>
          </div>
          {/* Withdraw Modal */}
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h5 className="mb-3">Withdraw Amount</h5>

                <input
                  type="number"
                  className="form-control mb-3"
                  placeholder="Enter amount"
                  value={withdrawAmount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setWithdrawAmount(e.target.value)
                  }
                />

                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="btn btn-primary"
                    disabled={loading}
                    onClick={handleWithdraw}
                  >
                    {loading ? "Processing..." : "Withdraw"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Withdrawal History */}
          <div className="row px-2 mt-3">
            <div className="col-12">
              <h6 className="weight-bold mb-3">Withdrawal History</h6>
            </div>

            <SectionLoader
              show={withdrawLoader.loading}
              size="medium"
              overlay={false}
              text="Loading..."
            />

            {!withdrawLoader.loading && withdrawalHistory.length === 0 ? (
              <div className="col-12 text-center py-4">
                <p className="font-14 color-grey">No withdrawal history found</p>
              </div>
            ) : (
              withdrawalHistory.map((item: any) => (
                <div className="col-12 mb-3" key={item._id}>
                  <div className="wallet-card shadow-sm p-3 rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="font-12 color-grey mb-1">Remarks</p>
                        <p className="font-14 mb-1 fw-semibold">{item.remarks}</p>

                        <p className="font-12 color-grey">
                          {dayjs(item.created_on).format("DD MMM YYYY • hh:mm A")}
                        </p>
                      </div>

                      <div className="wallet-right">
                        <span
                          className={`status-badge ${item.status === "completed"
                              ? "status-success"
                              : item.status === "pending"
                                ? "status-warning"
                                : "status-error"
                            }`}
                        >
                          {item.status}
                        </span>

                        <p className="amount">₹{item.amount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
      
      </div>
    </>
  );
}

export default Wallet;
