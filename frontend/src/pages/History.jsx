import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClockRotateLeft } from 'react-icons/fa6';

export default function History() {
    const navigate = useNavigate();
    return (
        <div className="history-wrap">
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate(-1)}><FaArrowLeft /></button>
                <h1 className="page-title">History</h1>
            </div>
            <div className="empty-state">
                <div className="empty-icon"><FaClockRotateLeft /></div>
                <div className="empty-title">Medication Log</div>
                <div className="empty-sub">View your full history in the Notifications tab.</div>
            </div>
        </div>
    );
}
