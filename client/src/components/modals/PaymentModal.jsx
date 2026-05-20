import { DollarSign } from 'lucide-react';

export default function PaymentModal({ paymentModal, setPaymentModal, actionLoading, executePayment }) {
  if (!paymentModal.shown) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setPaymentModal({ shown: false, jobId: null, freelancerId: null, title: '' })} />
      <div className="relative bg-white w-full max-w-lg border-2 border-black da-shadow-black p-8 animate-scale-in text-center">
         <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center border-2 border-black">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
         </div>
         <h3 className="text-2xl font-black text-daInfo-dark uppercase tracking-tight mb-2">DEPOSIT ESCROW</h3>
         <p className="text-gray-500 text-sm font-bold mb-6">
           You are about to deposit funds securely into Escrow to hire the freelancer for: <br/>
           <span className="text-black font-black mt-2 inline-block">"{paymentModal.title}"</span>
         </p>
         
         <div className="flex flex-col gap-4">
           <button 
             onClick={executePayment}
             disabled={actionLoading}
             className="w-full py-4 bg-daInfo-pink text-white font-black uppercase tracking-widest hover:bg-pink-600 transition-colors da-shadow-pink"
           >
             {actionLoading ? 'INITIALIZING...' : 'PROCEED TO SECURE CHECKOUT'}
           </button>
           <button 
             onClick={() => setPaymentModal({ shown: false, jobId: null, freelancerId: null, title: '' })}
             disabled={actionLoading}
             className="w-full py-4 border-2 border-gray-200 font-bold uppercase tracking-widest hover:bg-gray-50"
           >
             CANCEL
           </button>
         </div>
      </div>
    </div>
  );
}
