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
    <div className="mx-auto mt-8 max-w-md rounded-xl border border-[#e6ddd4] bg-white/90 p-8 text-center shadow-[var(--shadow-soft)]">
      <h2 className="mb-4 text-2xl font-bold text-[#24312f]">Registration Confirmation</h2>
      <p className={success ? 'text-[#25685f]' : 'text-[#53615d]'}>{status}</p>
      <Link
        to={success ? '/login' : '/register'}
        className="mt-6 inline-block rounded-lg bg-[#2f7d73] px-5 py-3 font-semibold text-white no-underline hover:bg-[#25685f]"
      >
        {success ? 'Go to Login' : 'Back to Register'}
      </Link>
    </div>
  );
}
