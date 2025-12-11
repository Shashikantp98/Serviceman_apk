import Input from "../components/inputs/input";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import ApiService from "../services/api";
import { toast } from "react-toastify";
import { useState } from "react";
import FileInput from "../components/inputs/FileInput";
import Header from "../components/Header";
import CommonHeader from "../components/CommonHeader";
import { useAuth } from "../contexts/AuthContext";

const Support = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const storeSchema = yup.object({
    subject: yup.string().required("Subject is required"),
    message: yup.string().required("Message is required"),
    attachments: yup.mixed().required("Attachments is required"),
  });

  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<any>({
    resolver: yupResolver(storeSchema as any),
  });
  const onSubmit = (data: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("subject", data.subject);
    formData.append("message", data.message);
    if (data.attachments && data.attachments.length > 0) {
      formData.append("attachments", data.attachments[0]);
    }
    ApiService.post("/user/createSupport", formData)
      .then((res: any) => {
        console.log(res);
        setLoading(false);
        toast.success(res.message);
        navigate(-1);
      })
      .catch((err: any) => {
        console.log(err);
        toast.error(err.response.data.message);
        setLoading(false);
      });
  };
  return (
    <>
      {role === "customer" ? <Header /> : <CommonHeader />}
      <div
        className={
          role === "customer"
            ? "container main-content"
            : "container main-content-service"
        }
      >
        <div className="row px-2 pt-3">
          <div className="col-12 pt-2">
            <h1 className="head4">Support</h1>
          </div>
        </div>
        <div className="row px-2">
          <div className="col-12 pt-3">
            <label className="lbl d-block ">Subject</label>
            <Input
              control={control}
              name="subject"
              label=""
              type="text"
              placeholder="Enter subject"
              inputMode="text"
              error={errors.subject?.message?.toString()}
              disabled={loading}
            />
          </div>
          <div className="col-12 pt-3">
            <label className="lbl d-block">Description</label>
            <Input
              control={control}
              name="message"
              label=""
              type="text"
              placeholder="Enter message"
              inputMode="text"
              error={errors.message?.message?.toString()}
              disabled={loading}
            />
          </div>
          <div className="col-12 pt-3">
            <label className="lbl">Attachments</label>
            <FileInput
              name="attachments"
              label=""
              control={control}
              multiple={false}
              error={errors.attachments?.message as string}
            />
          </div>
          <div className="col-12 pt-2" style={{ textAlign: "center" }}>
            {/* preview image */}
            {watch("attachments") && (
              <img
                style={{ height: "120px", width: "240px" }}
                src={URL.createObjectURL(watch("attachments")[0])}
                alt=""
                className="img-fluid"
              />
            )}
          </div>
          <div className="col-12 pt-3" style={{ marginBottom: "120px" }}>
            <button
              className="fill"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Support;
