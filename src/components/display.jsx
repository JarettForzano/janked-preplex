import { useParams } from 'react-router-dom';

export default function Display() {
  const { query } = useParams();
  return (
    <div>
      <h1>{decodeURIComponent(query)}</h1>
    </div>
  );
}
