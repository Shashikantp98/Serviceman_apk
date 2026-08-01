import { useEffect, useState } from 'react'
import { Calendar, Clock, Trash2 } from 'react-feather'
import ApiService from '../services/api'
import { toast } from 'react-toastify'
import { useSectionLoader } from "../utils/useSectionLoader";
import SectionLoader from "../components/SectionLoader";
import Support from './Support';

const Supportlist = () => {
    const getStatusText = (status: string) => {
        if (status?.toLowerCase() === 'open') return 'In Progress';
        if (!status) return 'Pending';
        return status
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const formatDate = (value: string) => {
        if (!value) return '-';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (value: string) => {
        if (!value) return '-';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const [supports, setSupports] = useState<any[]>([])

    const supportLoader = useSectionLoader("support-loader");

    useEffect(() => {
        supportLoader.setLoading(true);
        ApiService.post<any>("/user/listSupportForUser")
            .then((res: any) => {
                const items = res?.data?.data ?? res?.data ?? []
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

    if (!supportLoader.loading && supports.length === 0) {
        return <Support />;
    }

    return (
        <>
            <div className="container">
                <div className="row">
                    <div className="col-12 pt-4 pb-0">
                        <h3>Support Request</h3>
                    </div>
                </div>
                <SectionLoader
                    show={supportLoader.loading}
                    size="medium"
                    text="Loading request details..."
                    overlay={true}
                />

                {!supportLoader.loading && supports.map((item: any) => (
                    <div className="bookingcards mt-3" key={item?._id}>
                        <div className='basic_details_card d-flex justify-content-between align-items-start'>
                            <div>
                                <span className="bkg_id">Ticket ID : #{String(item?._id || '').slice(-6).toUpperCase()}</span>
                            </div>
                            <div>
                                <p className="status_detail color_org"> <Clock size={14} /> {getStatusText(item?.status)}</p>
                            </div>
                        </div>
                        <div>
                            <h2 className="ser_name pt-4">{item?.subject || 'No subject'}</h2>
                            <p>{item?.message || ''}</p>
                            <p className="shed_det"><Calendar size={14} /> {formatDate(item?.created_on)}</p>
                            <p className="shed_det"><Clock size={14} /> {formatTime(item?.created_on)}</p>
                        </div>
                        <div className="d-flex gap-3 pt-3">
                            <button className="paynow" type="button">View Details</button>
                            <button className="delete_req" type="button">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default Supportlist
