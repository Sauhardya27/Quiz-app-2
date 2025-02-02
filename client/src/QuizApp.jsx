import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Timer, Star, AlertCircle, Sun, Moon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from "@/components/ui/switch";

const QuizApp = () => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(30);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchQuizData();
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    let interval;
    if (!showResult && quizData && timer > 0 && isAnswered === false) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !isAnswered) {
      handleAnswer(null);
    }
    return () => clearInterval(interval);
  }, [timer, showResult, quizData, isAnswered]);

  const fetchQuizData = async () => {
    try {
      const API_URL = import.meta.env.MODE === "development" 
        ? "http://localhost:5001/api/quiz" 
        : "/api/quiz";

      const response = await fetch(API_URL);
      const data = await response.json();

      const formattedData = {
        title: data.title,
        topic: data.topic,
        questions: data.questions.map((q) => ({
          question: q.description,
          options: q.options.map((opt) => opt.description),
          correctAnswer: q.options.find((opt) => opt.is_correct)?.description || ""
        }))
      };

      setQuizData(formattedData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load quiz data. Please try again.');
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    setIsAnswered(true);
    setSelectedAnswer(answer);

    const currentQuestionData = quizData.questions[currentQuestion];
    const isCorrect = answer === currentQuestionData.correctAnswer;

    if (isCorrect) {
      const timeBonus = Math.floor(timer / 5);
      const streakBonus = streak >= 2 ? Math.floor(streak * 1.5) : 0;
      setScore(prev => prev + 10 + timeBonus + streakBonus);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < quizData.questions.length) {
        setCurrentQuestion(prev => prev + 1);
        setTimer(30);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setTimer(30);
    setStreak(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-blue-50'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-blue-50'}`}>
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900' : 'bg-blue-50'}`}>
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <Sun className="h-4 w-4 text-orange-400" />
          <Switch
            checked={isDarkMode}
            onCheckedChange={setIsDarkMode}
          />
          <Moon className="h-4 w-4 text-indigo-400" />
        </div>
        <Card className={`max-w-md mx-auto shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <CardHeader className="space-y-6">
            <CardTitle className="text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500 animate-bounce" />
              <span className={isDarkMode ? 'text-white' : 'text-indigo-600'}>Quiz Complete!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`text-center text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-indigo-600'}`}>
              Final Score: {score}
            </div>
            <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-indigo-500'}`}>
              You've completed all questions!
            </div>
            <Button
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-semibold py-4"
              onClick={restartQuiz}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestionData = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900' : 'bg-blue-50'}`}>
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <Sun className="h-4 w-4 text-orange-400" />
        <Switch
          checked={isDarkMode}
          onCheckedChange={setIsDarkMode}
        />
        <Moon className="h-4 w-4 text-indigo-400" />
      </div>
      <Card className={`max-w-2xl mx-auto shadow-xl ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
              <Timer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-600 dark:text-blue-400">{timer}s</span>
            </div>
            <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full">
              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-purple-600 dark:text-purple-400">Score: {score}</span>
            </div>
          </div>
          <Progress 
            value={progress} 
            className="w-full h-2 bg-blue-100 dark:bg-gray-700"
          />
          <div className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-indigo-600'}`}>
            Question {currentQuestion + 1} of {quizData.questions.length}
          </div>
          <CardTitle className="mt-6 text-xl font-semibold leading-tight">
            {currentQuestionData.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestionData.options.map((option, index) => (
            <Button
              key={index}
              variant={isDarkMode ? "outline" : "default"}
              className={`w-full justify-start h-auto p-4 text-left transition-all duration-200 ${
                isAnswered
                  ? option === currentQuestionData.correctAnswer
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : option === selectedAnswer
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-800'
                  : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-800'
              } font-medium rounded-xl shadow-sm hover:shadow-md`}
              onClick={() => !isAnswered && handleAnswer(option)}
              disabled={isAnswered}
            >
              <span className="mr-3 inline-block w-6 h-6 text-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </Button>
          ))}

          {streak >= 2 && (
            <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/50 dark:to-orange-900/50 dark:border-yellow-800">
              <Star className="h-4 w-4 text-yellow-500" />
              <AlertDescription className={`${isDarkMode ? 'text-yellow-100' : 'text-yellow-800'} font-medium`}>
                {streak} correct answers in a row! Keep it up for bonus points!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizApp;