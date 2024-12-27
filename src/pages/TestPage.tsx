import React from 'react';
import api from '../services/api';
import { devPrint } from '../components/utils/RandomUtils';

const ProtectedPage: React.FC = () => {
  const whoami = async (): Promise<void> => {
    const res = await api.get('/members/profile/');
    const data = res.data;
    devPrint(data);
  };

  return (
    <div className="container mt-3">
      <h1>React Cookie Auth</h1>
      <p>You are logged in!</p>
      <button onClick={whoami}>WhoAmI</button>
    </div>
  );
};

export default ProtectedPage;
