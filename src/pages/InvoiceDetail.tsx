import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import ApiService from "../services/api";
import CommonHeader from "../components/CommonHeader";
import SectionLoader from "../components/SectionLoader";
import { useSectionLoader } from "../utils/useSectionLoader";
import { generateAndDownloadInvoicePdf } from "../utils/invoicePdf";
import "./InvoiceDetail.css";

const amount2 = (value: any) => Number(value || 0).toFixed(2);

const formatAddress = (address: any) => {
    if (!address) return "-";
    return [
        address?.street_1,
        address?.street_2,
        address?.city,
        address?.state,
        address?.zip,
    ]
        .filter(Boolean)
        .join(", ");
};

const InvoiceDetail = () => {
    const location = useLocation();
    const { invoice_id } = useParams();

    const effectiveInvoiceId = (location.state as any)?.invoice_id || invoice_id;

    const [invoice, setInvoice] = useState<any>(null);
    const [downloading, setDownloading] = useState(false);

    const invoiceDetailLoader = useSectionLoader("invoice-detail");
    const invoicePaperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!effectiveInvoiceId) return;

        invoiceDetailLoader.setLoading(true);
        ApiService.getInvoice({ invoice_id: effectiveInvoiceId })
            .then((res: any) => {
                setInvoice(res?.data || null);
            })
            .catch((err: any) => {
                console.log(err);
                toast.error(err?.response?.data?.message || "Failed to load invoice");
            })
            .finally(() => {
                invoiceDetailLoader.setLoading(false);
            });
    }, [effectiveInvoiceId]);

    const handleDownload = async () => {
        if (!invoice || !invoicePaperRef.current) return;

        const invoiceRef = invoice?.invoice_number || invoice?.invoice_id || "invoice";

        try {
            setDownloading(true);
            const result = await generateAndDownloadInvoicePdf(invoicePaperRef.current, invoiceRef);
            toast.success("Invoice saved in phone");
            console.log("Saved file:", result.uri);
        } catch (err: any) {
            console.log(err);
            toast.error(err?.message || "Failed to save invoice");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <>
        <div className="pt-3">
            <CommonHeader />
            </div>
            <div className="container main-content-service pb-5 mb-5">
                <div className="row px-2 pt-4 pb-4">
                    <div className="col-12">
                        <SectionLoader
                            show={invoiceDetailLoader.loading}
                            size="medium"
                            text="Loading invoice..."
                        />

                        {!invoiceDetailLoader.loading && !invoice && (
                            <div className="cards5 text-center">
                                <p className="mb-0">Invoice not found</p>
                            </div>
                        )}

                        {!invoiceDetailLoader.loading && invoice && (
                            <>
                                <div className="invoice-paper mb-3" ref={invoicePaperRef}>
                                    <div className="invoice-header">
                                        <div className="invoice-brand">
                                            {invoice?.company_logo_url ? (
                                                <img
                                                    src={invoice?.company_logo_url}
                                                    alt="Company Logo"
                                                    className="invoice-logo"
                                                    crossOrigin="anonymous"
                                                />
                                            ) : (
                                                <div className="invoice-logo-fallback">
                                                    {(invoice?.invoice_type || "IS").slice(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="invoice-company-name">
                                                {invoice?.invoice_type
                                                    ? String(invoice.invoice_type).toUpperCase()
                                                    : "INSTASEVAK"}
                                            </div>
                                        </div>

                                        <button
                                            className="invoice-download-btn"
                                            onClick={handleDownload}
                                            disabled={downloading}
                                            type="button"
                                            aria-label="Download invoice PDF"
                                            title="Download invoice PDF"
                                            data-html2canvas-ignore="true"
                                        >
                                            {downloading ? (
                                                <span style={{ fontSize: 12, lineHeight: 1 }}>...</span>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                                    <path
                                                        d="M12 3v10m0 0 4-4m-4 4-4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>

                                    <div className="invoice-grid">
                                        <div className="invoice-grid-col">
                                            <div className="invoice-field">
                                                <div className="invoice-field-label">Customer Name</div>
                                                <div className="invoice-field-value">{invoice?.customer?.name || "-"}</div>
                                            </div>
                                            <div className="invoice-field">
                                                <div className="invoice-field-label">Invoice No.</div>
                                                <div className="invoice-field-value">{invoice?.invoice_number || "-"}</div>
                                            </div>
                                            <div className="invoice-field">
                                                <div className="invoice-field-label">Delivery Address</div>
                                                <div className="invoice-field-value">
                                                    {formatAddress(invoice?.customer_address)}
                                                </div>
                                            </div>
                                            <div className="invoice-field">
                                                <div className="invoice-field-label">Invoice Date</div>
                                                <div className="invoice-field-value">
                                                    {invoice?.issued_on
                                                        ? dayjs(invoice.issued_on).format("DD MMM YYYY")
                                                        : "-"}
                                                </div>
                                            </div>
                                            <div className="invoice-field">
                                                <div className="invoice-field-label">Transaction ID</div>
                                                <div className="invoice-field-value">{invoice?.transaction_id || "-"}</div>
                                            </div>
                                        </div>

                                        <div className="invoice-grid-col">
                                            <div className="invoice-provider-label">DELIVERY SERVICE PROVIDER</div>
                                            <div className="invoice-field">
                                                <div className="invoice-field-label">Business Name</div>
                                                <div className="invoice-field-value">{invoice?.serviceman?.name || "-"}</div>
                                            </div>
                                            <div className="invoice-field">
                                                <div className="invoice-field-label">Address</div>
                                                <div className="invoice-field-value">
                                                    {formatAddress(invoice?.serviceman_address)}
                                                </div>
                                            </div>
                                            <div className="invoice-field">
                                                <div className="invoice-field-label">State Name & Code</div>
                                                <div className="invoice-field-value">
                                                    {invoice?.serviceman_address?.state
                                                        ? `${invoice?.serviceman_address?.state}${invoice?.serviceman_address?.zip
                                                            ? ` (${invoice?.serviceman_address?.zip})`
                                                            : ""
                                                        }`
                                                        : invoice?.serviceman?.state_name
                                                            ? `${invoice?.serviceman?.state_name}${invoice?.serviceman?.state_code
                                                                ? ` (${invoice?.serviceman?.state_code})`
                                                                : ""
                                                            }`
                                                            : "-"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="invoice-items">
                                        <div className="invoice-items-head">
                                            <span>Items</span>
                                            <span>Taxable Value</span>
                                        </div>

                                        <div className="invoice-item-row">
                                            <div>
                                                <div className="invoice-item-name">
                                                    {invoice?.booking?.job_description ||
                                                        `Service (${invoice?.booking?.bkng_id || "-"})`}
                                                </div>
                                            </div>
                                            <div className="invoice-item-taxable">
                                                ₹{amount2(invoice?.bill_details?.base_price_amount)}
                                            </div>
                                        </div>

                                        <div className="invoice-line-row">
                                            <span>Discount</span>
                                            <span>₹0.00</span>
                                        </div>
                                        <div className="invoice-line-row">
                                            <span>Platform Share Amount</span>
                                            <span>₹{amount2(invoice?.bill_details?.platform_net_amount)}</span>
                                        </div>
                                        <div className="invoice-line-row">
                                            <span>GST @{amount2(invoice?.bill_details?.gst_percent)}%</span>
                                            <span>₹{amount2(invoice?.bill_details?.gst_amount)}</span>
                                        </div>

                                        <div className="invoice-total-row">
                                            <span>TOTAL AMOUNT</span>
                                            <span>
                                                ₹{amount2(
                                                    invoice?.bill_details?.customer_total_amount || invoice?.invoice_amount
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="invoice-meta">
                                        <div className="invoice-meta-item">
                                            <span>Booking ID:</span> {invoice?.booking?.bkng_id || "-"}
                                        </div>
                                        <div className="invoice-meta-item">
                                            <span>Booking Date:</span>{" "}
                                            {invoice?.booking?.booking_date
                                                ? dayjs(invoice.booking.booking_date).format("DD MMM YYYY")
                                                : "-"}
                                        </div>
                                        <div className="invoice-meta-item">
                                            <span>Booking Time:</span> {invoice?.booking?.booking_time || "-"}
                                        </div>
                                        <div className="invoice-meta-item">
                                            <span>Status:</span> {invoice?.booking?.booking_status || "-"}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default InvoiceDetail;