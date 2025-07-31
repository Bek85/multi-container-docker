import { Link } from "react-router-dom";

const OtherPage = () => {
  return (
    <div>
      <h1>Other Page</h1>
      <Link to="/" style={{ padding: '10px' }}>Go back home</Link>
    </div>
  );
};

export default OtherPage;
