import { useState } from "react";

export default function StartScreen({ numQuestions, difficulty, dispatch }) {
  return (
    <div className="start">
      <h2>Welcome to the React Quiz!</h2>
      <h3>{numQuestions} questions to test your React mastery</h3>
      <h3>Choose your difficulty</h3>
      <ol className="difficulty-select">
        <li>
          <button
            className={`btn easy ${difficulty === "easy" ? "selected" : ""}`}
            onClick={() =>
              dispatch({
                type: "setDifficulty",
                payload: "easy",
              })
            }
          >
            Easy
          </button>
        </li>
        <li>
          <button
            className={`btn medium ${
              difficulty === "medium" ? "selected" : ""
            }`}
            onClick={() =>
              dispatch({
                type: "setDifficulty",
                payload: "medium",
              })
            }
          >
            Medium
          </button>
        </li>
        <li>
          <button
            className={`btn hard ${difficulty === "hard" ? "selected" : ""}`}
            onClick={() =>
              dispatch({
                type: "setDifficulty",
                payload: "hard",
              })
            }
          >
            Hard
          </button>
        </li>
      </ol>
      <button
        className="btn btn-ui"
        onClick={() =>
          dispatch({ type: "start", payload: { difficulty: difficulty } })
        }
      >
        Let's start
      </button>
    </div>
  );
}
