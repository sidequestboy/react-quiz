import { useEffect } from "react";

export default function Timer({ dispatch, secondsRemaining }) {
  const mins = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  useEffect(() => {
    const timerId = setInterval(() => {
      // console.log("tick");
      dispatch({ type: "tick" });
    }, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, [dispatch]);
  return (
    <div className="timer">
      {mins < 10 && "0"}
      {mins}:{seconds}
    </div>
  );
}
