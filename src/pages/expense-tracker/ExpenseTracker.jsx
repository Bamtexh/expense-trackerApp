import { useState } from "react";
import { useAddTransaction } from "../../hooks/useAddTransaction";
import { useGetTransactions } from "../../hooks/useGetTransactions";
import { useGetUserInfo } from "../../hooks/useGetUserInfo";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase-config";
import { db } from "../../config/firebase-config";
import { doc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./styles.css";


export const ExpenseTracker = () => {
  const { addTransaction } = useAddTransaction();
  const { transactions, transactionTotal } = useGetTransactions();
  const { name, profilePhoto } = useGetUserInfo();
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [transactionAmount, setTransactionAmount] = useState();
  const [transactionType, setTransactionType] = useState("expense");

  const { balance, income, expenses } = transactionTotal;
  const onSubmit = (e) => {
    e.preventDefault();
    addTransaction({
      description,
      transactionAmount,
      transactionType,
    });
    setDescription("");
    setTransactionAmount("");
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      // Delete the transaction document from Firestore
      await deleteDoc(doc(db, "transactions", transactionId));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };
  const signUserOut = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <>
      <div className="expense-tracker">
        <div className="container">
          {profilePhoto && (
            <img className="profile-photo" src={profilePhoto} alt="" />
          )}
          <h1> {name}'s Expense Tracker</h1>
          <button className="sign-out" onClick={signUserOut}>
            Sign out
          </button>
          <div className="balance">
            <h3>Your Balance</h3>
            {balance >= 0 ? (
              <h2> &#8358;{balance}</h2>
            ) : (
              <h2> -&#8358;{balance * -1}</h2>
            )}
          </div>
          <div className="summary">
            <div className="income">
              <h4> Income </h4>
              <p>&#8358; {income}</p>
            </div>
            <div className="expenses">
              <h4> Expenses </h4>
              <p>&#8358; {expenses}</p>
            </div>
          </div>
          <form className="add-transaction" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Description"
              value={description}
              required
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              value={transactionAmount}
              required
              onChange={(e) => setTransactionAmount(e.target.value)}
            />
            <input
              type="radio"
              id="expense"
              value="expense"
              checked={transactionType === "expense"}
              onChange={(e) => setTransactionType(e.target.value)}
            />
            <label htmlFor="expense">Expenses</label>
            <input
              type="radio"
              id="income"
              value="income"
              checked={transactionType === "income"}
              onChange={(e) => setTransactionType(e.target.value)}
            />
            <label htmlFor="income">Income</label>
            <button type="submit">Add Transactions</button>
          </form>
        </div>
      </div>
      {/* Transactions */}
      <div className="transactions">
        <h3>Transactions</h3>
        <ul>
          {transactions.map((transaction, index) => {
            const { description, transactionAmount, transactionType } =
              transaction;
            return (
              <li key={index}>
                <h4> {description} </h4>
                <p>&#8358;{transactionAmount} &#x2022;
                  <label style={{
                      color: transactionType === "expense" ? "red" : "green",
                    }}
                  >
                    {transactionType}
                  </label>
                </p>
                <button className="delete-button" onClick={() => handleDeleteTransaction(transaction.id)}>
                  X
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default ExpenseTracker;
