import { useState } from 'react';
import ShipmentForm from '../Components/ShipmentForm';
import { useCreateShipment } from '../hooks/api';
import { getApiErrorMessage } from '../api/errors';

export default function AddShipmentPage() {
  const createShipment = useCreateShipment();
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (payload) => {
    setSuccessMsg('');
    createShipment.mutate(payload, {
      onSuccess: () => {
        setSuccessMsg('Shipment created successfully!');
      },
    });
  };

  return (
    <div className="fade-in">
      <ShipmentForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createShipment.isPending}
        submitError={createShipment.isError ? getApiErrorMessage(createShipment.error) : undefined}
        submitSuccess={successMsg || (createShipment.isSuccess ? 'Shipment created successfully!' : undefined)}
      />
    </div>
  );
}
