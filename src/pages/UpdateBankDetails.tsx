import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import SectionLoader from "../components/SectionLoader";

interface BankForm {
  upi_id?: string;
  account_name?: string;
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
}

const schema = Yup.object({
  upi_id: Yup.string()
    .trim()
    .nullable()
    .test("isValidUPI", "Invalid UPI ID format", (value) => {
      if (!value) return true;
      return /^[\w.-]{2,}@[\w.-]{2,}$/.test(value);
    }),
  account_name: Yup.string().notRequired(),
  bank_name: Yup.string().notRequired(),
  account_number: Yup.string()
    .notRequired()
    .nullable()
    .matches(/^[0-9]{9,18}$/, { message: "Account number must be 9–18 digits", excludeEmptyString: true }),
  ifsc_code: Yup.string()
    .notRequired()
    .nullable()
    .matches(/^[A-Za-z]{4}\d{7}$/, { message: "Invalid IFSC format", excludeEmptyString: true }),
});

const UpdateBankDetails: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<BankForm>({
    resolver: yupResolver(schema) as any,
  });

  // Load existing bank details to prefill
  useEffect(() => {
    if (!token) return setLoadingInit(false);
    ApiService.get("/servicemen/getServicemenDetails")
      .then((res: any) => {
        const bank = res.data?.bank_details || {};
        setValue("upi_id" as any, bank.upi_id || "");
        setValue("account_name" as any, bank.account_name || "");
        setValue("bank_name" as any, bank.bank_name || "");
        setValue("account_number" as any, bank.account_number || "");
        setValue("ifsc_code" as any, bank.ifsc_code || "");
      })
      .catch((err) => {
        console.error("Error loading bank details:", err);
      })
      .finally(() => setLoadingInit(false));
  }, [token, setValue]);

  const onSubmit = async (data: BankForm) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("bank", JSON.stringify(data));
      await ApiService.post("/servicemen/editServicemen", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Bank details updated.");
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update bank details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h4 className="mb-3">Update Bank Details</h4>

      <SectionLoader show={loadingInit} size="large" text="Loading..." />

      {!loadingInit && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">UPI ID</label>
            <input className="form-control" {...(control as any).register?.("upi_id")} />
            {errors.upi_id && <p className="text-danger small">{errors.upi_id.message}</p>}
          </div>

          <div className="mb-3">
            <label className="form-label">Account Name</label>
            <input className="form-control" {...(control as any).register?.("account_name")} />
            {errors.account_name && <p className="text-danger small">{errors.account_name.message}</p>}
          </div>

          <div className="mb-3">
            <label className="form-label">Bank Name</label>
            <input className="form-control" {...(control as any).register?.("bank_name")} />
            {errors.bank_name && <p className="text-danger small">{errors.bank_name.message}</p>}
          </div>

          <div className="mb-3">
            <label className="form-label">Account Number</label>
            <input className="form-control" {...(control as any).register?.("account_number")} />
            {errors.account_number && <p className="text-danger small">{errors.account_number.message}</p>}
          </div>

          <div className="mb-3">
            <label className="form-label">IFSC Code</label>
            <input className="form-control" {...(control as any).register?.("ifsc_code")} />
            {errors.ifsc_code && <p className="text-danger small">{errors.ifsc_code.message}</p>}
          </div>

          <div className="d-flex gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update Bank Details"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdateBankDetails;
