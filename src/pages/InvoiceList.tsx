import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import ApiService from "../services/api";
import CommonHeader from "../components/CommonHeader";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";

const amount2 = (value: any) => Number(value || 0).toFixed(2);

const InvoiceList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking_id } = useParams();

  const effectiveBookingId = (location.state as any)?.booking_id || booking_id;

  const [invoices, setInvoices] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const invoiceListLoader = useSectionLoader("invoice-list");

  useEffect(() => {
    if (!effectiveBookingId) return;

    invoiceListLoader.setLoading(true);
    ApiService.listInvoices({ booking_id: effectiveBookingId })
      .then((res: any) => {
        const payload = res?.data || {};
        setTotal(payload?.total || 0);
        setInvoices(payload?.invoices || []);
      })
      .catch((err: any) => {
        console.log(err);
      })
      .finally(() => {
        invoiceListLoader.setLoading(false);
      });
  }, [effectiveBookingId]);

  return (
    <>
      <CommonHeader />
      <div className="container main-content-service">
        <div className="row px-2 pt-2">
          <div className="col-12">
            <h3 className="mb-1 pt-1">Invoices</h3>
            <p className="font-12 color-grey mb-0">
              Booking: {effectiveBookingId || "N/A"}
            </p>
            <p className="font-12 color-grey">Total: {total}</p>
          </div>
        </div>

        <div className="row px-2 pb-4">
          <div className="col-12">
            <SectionLoader
              show={invoiceListLoader.loading}
              size="medium"
              text="Loading invoices..."
            />

            {!invoiceListLoader.loading && invoices.length === 0 && (
              <div className="cards5 text-center">
                <p className="mb-0">No invoices found</p>
              </div>
            )}

            {!invoiceListLoader.loading &&
              invoices.map((invoice: any) => (
                <div
                  key={invoice?.invoice_id}
                  className="cards5 mb-2"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/invoice/${invoice?.invoice_id}`, {
                      state: {
                        invoice_id: invoice?.invoice_id,
                        booking_id: effectiveBookingId,
                      },
                    })
                  }
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="mb-1 font-14">
                        <b>{invoice?.invoice_number || "-"}</b>
                      </p>
                      <p className="mb-0 font-12 color-grey">
                        Stage: {invoice?.payment_stage || "-"}
                      </p>
                      <p className="mb-0 font-12 color-grey">
                        Status: {invoice?.invoice_status || "-"}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="mb-1 font-14">₹{amount2(invoice?.invoice_amount)}</p>
                      <p className="mb-0 font-12 color-grey">
                        {invoice?.issued_on
                          ? dayjs(invoice.issued_on).format("DD MMM YYYY")
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceList;
