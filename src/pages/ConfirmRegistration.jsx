import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function ConfirmRegistration() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? 'Confirming registration...' : 'Confirmation token is missing.');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    const confirm = async () => {
      try {
        const response = await axios.post('api/v2/users/confirm-registration', { token });
        setSuccess(true);
        setStatus(response.data.message || 'Registration confirmed. You can now log in.');
      } catch (error) {
        setStatus(
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Could not confirm registration.'
        );
      }
    };

    confirm();
  }, [token]);

  return (
    <div className="mx-auto mt-8 max-w-md rounded-lg bg-white p-8 text-center shadow">
      <h2 className="mb-4 text-2xl font-bold">Registration Confirmation</h2>
      <p className={success ? 'text-green-700' : 'text-gray-700'}>{status}</p>
      <Link
        to={success ? '/login' : '/register'}
        className="mt-6 inline-block rounded-md bg-indigo-600 px-5 py-3 font-semibold text-white no-underline hover:bg-indigo-700"
      >
        {success ? 'Go to Login' : 'Back to Register'}
      </Link>
    </div>
  );
}
