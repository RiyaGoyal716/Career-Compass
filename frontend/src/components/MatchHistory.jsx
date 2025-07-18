function MatchHistory() {
  const history = JSON.parse(localStorage.getItem("matchHistory")) || [];

  return (
    <div className="history-box">
      <h3>📚 Previous Matches</h3>
      {history.length === 0 ? (
        <p>No history yet.</p>
      ) : (
        <ul>
          {history.map((item, i) => (
            <li key={i}>
              <div>{new Date(item.timestamp).toLocaleString()}</div>
              <pre>{item.content.slice(0, 100)}...</pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MatchHistory;
