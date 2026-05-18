import { useState } from 'react';
import ShipmentForm from '../Components/ShipmentForm';
import { useCreateShipment } from '../hooks/api';
import { getApiFieldErrors } from '../api/errors';

export default function AddShipmentPage() {
  const createShipment = useCreateShipment();
  const [successMsg, setSuccessMsg] = useState('');
  const [serverFieldErrors, setServerFieldErrors] = useState({});

  const handleSubmit = (payload) => {
    setSuccessMsg('');
    setServerFieldErrors({});
    createShipment.mutate(payload, {
      onSuccess: () => {
        setSuccessMsg('Shipment created successfully!');
        setServerFieldErrors({});
      },
      onError: (err) => setServerFieldErrors(getApiFieldErrors(err)),
    });
  };

  return (
    <div className="fade-in">
      <ShipmentForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createShipment.isPending}
        serverFieldErrors={serverFieldErrors}
        submitSuccess={successMsg || (createShipment.isSuccess ? 'Shipment created successfully!' : undefined)}
      />
    </div>
  );
}
