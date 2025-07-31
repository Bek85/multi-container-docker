import { useState, useEffect } from 'react';

const Fib = () => {
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndex] = useState('');

  const fetchValues = async () => {
    const values = await fetch('/api/values/current');
    const json = await values.json();
    setValues(json);
  };

  const fetchIndexes = async () => {
    const seenIndexes = await fetch('/api/values/all');
    const json = await seenIndexes.json();
    setSeenIndexes(json);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await fetch('/api/values', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: index }),
    });
    setIndex('');
  };

  useEffect(() => {
    fetchValues();
    fetchIndexes();
  }, []);

  return (
    <div>
      <h1>Fib</h1>
      <form onSubmit={handleSubmit}>
        <label>Enter your index:</label>
        <input value={index} onChange={(event) => setIndex(event.target.value)} />
        <button>Submit</button>
      </form>
      <h3>Indices I have seen:</h3>
      {seenIndexes.map(({ number }) => number).join(', ')}
      <h3>Calculated values:</h3>
      {Object.keys(values).map((key) => (
        <div key={key}>
          For index {key} I calculated {values[key]}
        </div>
      ))}
    </div>
  );
};

export default Fib;
