import React, { useState } from "react";
import "./App.css";

const INTEREST_RATES = {
  1: 0.02,
  5: 0.03,
  10: 0.035,
  20: 0.045,
  30: 0.05,
};

const EXCLUDED_POSTCODES = ["9679", "9681", "9682"];

function App() {
  const [income, setIncome] = useState("");
  const [partnerIncome, setPartnerIncome] = useState("");
  const [studyDebt, setStudyDebt] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [term, setTerm] = useState(30);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const calculateMortgage = () => {
    setError(""); // Reset de foutmelding
    const totalIncome = parseFloat(income) + parseFloat(partnerIncome || 0);

    // Controleer of de invoer geldig is
    if (isNaN(totalIncome) || totalIncome <= 0 || !INTEREST_RATES[term]) {
      setError("Ongeldige invoer.");
      return; // Stop als het inkomen ongeldig is
    }

    // Controleer of de postcode geldig is (4 cijfers en 2 letters)
    const postcodePattern = /^\d{4}[A-Za-z]{2}$/;
    if (
      !postcodePattern.test(postcode) ||
      EXCLUDED_POSTCODES.includes(postcode)
    ) {
      setError("ongeldige postcode ingevoerd"); // Ensure this is in lowercase to match the test
      return; // Stop als de postcode ongeldig is
    }

    let maxLoan = totalIncome * 4.25;
    if (studyDebt) {
      maxLoan *= 0.75;
    }

    const monthlyInterestRate = INTEREST_RATES[term] / 12;
    const monthlyRepayment = maxLoan / (term * 12);
    const monthlyInterest = maxLoan * monthlyInterestRate;
    const totalPayment = (monthlyRepayment + monthlyInterest) * term * 12;

    setResult({
      maxLoan: maxLoan.toFixed(2),
      monthlyRepayment: monthlyRepayment.toFixed(2),
      monthlyInterest: monthlyInterest.toFixed(2),
      totalPayment: totalPayment.toFixed(2),
    });
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="title">Hypotheek Maatje</h1>
        <div className="form-group">
          <label>
            Jaarinkomen:
            <input
              data-testid="jaarinkomen"
              type="number"
              className="input"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Jaarinkomen partner (optioneel):
            <input
              type="number"
              className="input"
              value={partnerIncome}
              onChange={(e) => setPartnerIncome(e.target.value)}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Studieschuld:
            <input
              type="checkbox"
              className="checkbox"
              checked={studyDebt}
              onChange={() => setStudyDebt(!studyDebt)}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Postcode:
            <input
              type="text"
              className="input"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
            />
          </label>
        </div>
        <div className="form-group">
          <label>
            Rentevaste periode:
            <select
              className="select"
              value={term}
              onChange={(e) => setTerm(parseInt(e.target.value))}
            >
              {Object.keys(INTEREST_RATES).map((key) => (
                <option key={key} value={key}>
                  {key} jaar
                </option>
              ))}
            </select>
          </label>
        </div>
        <button className="button" onClick={calculateMortgage}>
          Bereken hypotheek
        </button>
        {error && <p className="error">{error}</p>}{" "}
        {/* Ensure error message renders in a single element */}
        {result && (
          <div className="result">
            <h2>Resultaat</h2>
            <p>
              <strong>Maximaal te lenen:</strong> €{result.maxLoan}
            </p>
            <p>
              <strong>Maandlasten:</strong> €{result.monthlyRepayment}
            </p>
            <p>
              <strong>Maandlasten rente:</strong> €{result.monthlyInterest}
            </p>
            <p>
              <strong>Totaal betaald na {term} jaar:</strong> €
              {result.totalPayment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
