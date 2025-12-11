import { useEffect, useState } from 'react'
import { Clock, Paperclip, Phone } from 'react-feather'
import { useNavigate } from "react-router-dom";
import ApiService from '../services/api'
import { toast } from 'react-toastify'
import attach from '../assets/pro.jpeg'
import { useSectionLoader } from "../utils/useSectionLoader";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import CommonHeader from "../components/CommonHeader";
import SectionLoader from "../components/SectionLoader";

const Supportlist = () => {
    // Helper to get status class
    const getStatusClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'open':
                return 'status-pending';
            case 'resolved':
            case 'completed':
                return 'status-completed';
            case 'cancelled':
                return 'status-cancelled';
            case 'processing':
                return 'status-processing';
            default:
                return 'status-pending';
        }
    };
    const navigate = useNavigate();
    const { role } = useAuth();
    const [supports, setSupports] = useState<any[]>([])
    const [showImageModal, setShowImageModal] = useState<{ src: string, visible: boolean }>({ src: '', visible: false })

    const supportLoader = useSectionLoader("support-loader");

    useEffect(() => {
        supportLoader.setLoading(true);
        ApiService.post<any>("/user/listSupportForUser")
            .then((res: any) => {
                const items = res?.data || []
                setSupports(items)
            })
            .catch((err: any) => {
                console.error(err)
                toast.error(err?.response?.data?.message || "Failed to load support list")
            })
            .finally(() => {
                supportLoader.setLoading(false)
            })
    }, [])

    const openModal = (src: string) => setShowImageModal({ src, visible: true })
    const closeModal = () => setShowImageModal({ src: '', visible: false })

    return (
        <>
            <div className='customer_header_none'></div>
            {role === "customer" ? <Header /> : <CommonHeader />}

            <div
                className={
                    role === "customer"
                        ? "container main-content pt-2"
                        : "container main-content-service"
                }
                style={{ paddingBottom: "80px" }}
            >


                <div className='fixed_header text-center'>
                    <h1 className="head4">Support</h1>
                </div>

                <div className="row px-2 fixed_header_padding">
                    <SectionLoader
                        show={supportLoader.loading}
                        size="medium"
                        text="Loading request details..."
                        overlay={true}
                    />

                    {!supportLoader.loading && supports.length === 0 && (
                        <div className="col-12 fixed_header_padding text-center mt-5 d-flex flex-column align-items-center">
                            <h1 className="bigemj">📨</h1>
                            <p>No support requests found</p>
                        </div>
                    )}
                    {supports.map((item: any) => {
                        const statusText = item.status === 'open' ? 'Pending' : item.status || 'Pending';
                        const attachments = item.attachments;
                        const attachmentArray = Array.isArray(attachments) ? attachments : attachments ? [attachments] : [];

                        return (
                            <div className="col-12 mt-3" key={item._id}>
                                <div className="cards5 p-3">
                                    <div className='d-flex align-items-center border-bottom pb-3 justify-content-between'>
                                        <h2 className='mb-0 font-14'>{item.subject || 'No subject'}</h2>
                                        <span className={`font-12 mb-0 d-flex align-items-center ${getStatusClass(item.status)}`}>
                                            <Clock size={14} /> &nbsp;{statusText}
                                        </span>
                                    </div>
                                    <div className="pt-2">
                                        <p className='font-12'>{item.message || ''}</p>
                                    </div>
                                    <div>
                                        <b className='font-12'>Attachment</b>
                                        {attachmentArray.length === 0 && (
                                            <p className='font-12 text-secondary mb-0 pt-1'>
                                                <Paperclip size={14} /> No attachment found
                                            </p>
                                        )}
                                        {attachmentArray.length > 0 && (
                                            <div className='d-flex flex-wrap gap-3 pt-2 '>
                                                {attachmentArray.map((src: string, idx: number) => (
                                                    <div
                                                        key={idx}
                                                        className="attachmentss"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => openModal(src)}
                                                    >
                                                        <img
                                                            src={src || attach}
                                                            alt={`attachment-${idx}`}
                                                            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "8px" }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Image Modal */}
                {showImageModal.visible && (
                    <div
                        className="modal-overlay"
                        onClick={closeModal}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 9999,
                        }}
                    >
                        <div
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: "relative",
                                maxWidth: "90vw",
                                maxHeight: "90vh",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                padding: "20px",
                            }}
                        >
                            <button
                                onClick={closeModal}
                                style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    background: "none",
                                    border: "none",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: "#000",
                                }}
                            >
                                ✕
                            </button>
                            <img
                                src={showImageModal.src}
                                alt="Full view"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "80vh",
                                    objectFit: "contain",
                                    borderRadius: "8px",
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className="row px-2 pt-4 mb-5">
                    <div className="col-12 text-center">
                        <button className='contact_sprt' onClick={() => navigate("/support")}>
                            <Phone size={18} />
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Supportlist
