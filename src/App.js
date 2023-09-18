import { useEffect, useReducer } from "react";
import Header from "./components/Header";
import Loader from "./components/Loader";
import Error from "./components/Error";
import Main from "./components/Main";
import StartScreen from "./components/StartScreen";
import Question from "./components/Question";
import "./styles.css";
import NextButton from "./components/NextButton";
import Progress from "./components/Progress";
import FinishScreen from "./components/FinishScreen";
import Footer from "./components/Footer";
import Timer from "./components/Timer";

const SECS_PER_QUESTION = 30;

const initialState = {
  questions: [],
  filteredQuestions: [],
  index: 0,
  answer: null,
  // "loading", "error", "ready", "active", "finished"
  status: "loading",
  points: 0,
  highscore: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
  secondsRemaining: null,
  difficulty: "medium",
};
function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payload.questions,
        filteredQuestions: action.payload.questions.filter(
          (q) => q.difficulty === state.difficulty
        ),
        highscore: action.payload.scoreData.highscore,
        status: "ready",
      };
    case "dataError":
      return {
        ...state,
        status: "error",
      };
    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.filteredQuestions.length * SECS_PER_QUESTION,
        difficulty: action.payload.difficulty,
      };
    case "setDifficulty":
      return {
        ...state,
        difficulty: action.payload,
        filteredQuestions: state.questions.filter(
          (q) => q.difficulty === action.payload
        ),
      };
    case "newAnswer":
      const question = state.filteredQuestions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return {
        ...state,
        index: state.index + 1,
        answer: null,
      };
    case "finish":
      const highscore = {
        ...state.highscore,
        [state.difficulty]:
          state.points > state.highscore[state.difficulty]
            ? state.points
            : state.highscore[state.difficulty],
      };
      if (highscore[state.difficulty] !== state.highscore[state.difficulty]) {
        fetch("http://localhost:8000/score-data", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ highscore: highscore }),
        });
      }
      return {
        ...state,
        status: "finished",
        highscore: highscore,
      };
    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };
    case "reset":
      return {
        ...initialState,
        status: "ready",
        questions: state.questions,
        highscore: state.highscore,
      };
    default:
      throw new Error("Action unknown.");
  }
}

export default function App(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    answer,
    index,
    questions,
    status,
    points,
    highscore,
    secondsRemaining,
    difficulty,
  } = state;
  const filteredQuestions = questions.filter(
    (q) => q.difficulty === difficulty
  );
  const numQuestions = filteredQuestions.length;
  const maxPossiblePoints = filteredQuestions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/questions"),
      fetch("http://localhost:8000/score-data"),
    ])
      .then((arr) => Promise.all(arr.map((res) => res.json())))
      .then((arr) => ({ questions: arr[0], scoreData: arr[1] }))
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch((err) => dispatch({ type: "dataError" }));
  }, []);
  return (
    <div className="app">
      <Header />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen
            numQuestions={numQuestions}
            difficulty={difficulty}
            dispatch={dispatch}
          />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Question
              question={filteredQuestions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                numQuestions={numQuestions}
                index={index}
              />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <FinishScreen
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            highscore={highscore[difficulty]}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
}
