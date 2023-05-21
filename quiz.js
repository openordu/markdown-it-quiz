document.addEventListener("DOMContentLoaded", function () {
  let currentQuestion = 0;
  const parentContainer = document.getElementById("parentContainer");
  const quizContainer = parentContainer.querySelector("#quiz");
  const result = parentContainer.querySelector("#score");
  const questions = parentContainer.getElementsByClassName("question");

  function initQuestions() {
    result.innerHTML = `${currentQuestion}`;
    for (let i = 0; i < questions.length; i++) {
      questions[i].style.display = i === currentQuestion ? "block" : "none";
    }
  }

  function showQuestion() {
    for (let i = 0; i < questions.length; i++) {
      questions[i].style.display = i === currentQuestion ? "block" : "none";
      if (currentQuestion === i) {
        result.innerHTML = `${i}`;
      }
    }
  }

  function checkProgress(target) {
    const question = questions[currentQuestion];
    const qtype = question.getAttribute("data-qtype");

    switch (qtype) {
      case "match":
        matched = Array.from(question.querySelectorAll('.list-group-item-secondary:not([disabled])'));
        if (matched.length === 2) {
          const firstIndex = Array.from(matched[0].parentNode.children).indexOf(matched[0]);
          const secondIndex = Array.from(matched[1].parentNode.children).indexOf(matched[1]);
          quizContainer.classList.add(`${firstIndex}-${secondIndex}`);

          let correctAnswers = question.getAttribute("data-answers").split(",").map(Number);
          if (correctAnswers.length % 2 !== 0) {
            correctAnswers.pop();
          }
          let correctAnswersPairs = [];
          for (let i = 0; i < correctAnswers.length; i += 2) {
            correctAnswersPairs.push(correctAnswers.slice(i, i + 2));
          }
          const selectedPair = [firstIndex, secondIndex];
          const isCorrect = correctAnswersPairs.some(pair =>
            (pair[0] === selectedPair[0] && pair[1] === selectedPair[1]) ||
            (pair[0] === selectedPair[1] && pair[1] === selectedPair[0])
          );

          if (isCorrect) {
            matched[0].classList.add("list-group-item-primary");
            matched[1].classList.add("list-group-item-primary");
            matched[0].disabled = true;
            matched[1].disabled = true;
          } else {
            matched[0].classList.add("list-group-item-danger");
            matched[1].classList.add("list-group-item-danger");
            setTimeout(() => {
              matched[0].classList.remove("list-group-item-danger");
              matched[1].classList.remove("list-group-item-danger");
              matched[0].classList.remove("list-group-item-secondary");
              matched[1].classList.remove("list-group-item-secondary");
            }, 3000);
            return;
          }
        }
        const allMatched = Array.from(question.querySelectorAll('.btn')).every(btn => btn.disabled);
        if (allMatched) {
          setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < questions.length) {
              showQuestion();
            } else {
              result.innerHTML = `${questions.length}`;
              quizContainer.innerHTML = "";
            }
          }, 1000);
        }
        break;
      case "multiple-choice":
        if (target) {
            const selectedIndex = Array.from(target.parentNode.children).indexOf(target);
            const correctAnswers = question.getAttribute("data-answers")
                .split(",")
                .map(Number);

            const allCorrectAnswersSelected = Array.from(target.parentNode.children)
            .filter(child => child.classList.contains("list-group-item-primary"))
            .length === correctAnswers.length;
          
          if (allCorrectAnswersSelected) {
            setTimeout(() => {
              currentQuestion++;
              if (currentQuestion < questions.length) {
                showQuestion();
              } else {
                result.innerHTML = `${questions.length}`;
                quizContainer.innerHTML = "";
              }
            }, 1000);
          }
        }
        break;
        case "fill-in-the-blank":
          if (target.tagName === "BUTTON") {
            // Apply selected option to the first blank field
            const inlineInputs = Array.from(question.querySelectorAll(".form-control-inline"));
            const selectedOption = target.textContent;
            let blankInput = inlineInputs.find(input => input.value === "");
            if (blankInput) {
              blankInput.value = selectedOption;
              blankInput.setAttribute("readonly", true);
              const correctAnswer = blankInput.getAttribute("data-answer");
              if (selectedOption === correctAnswer) {
                target.classList.add("list-group-item-primary");
              } else {
                target.classList.add("list-group-item-danger");
              }
            }
        
            // Check if all inputs are filled
            const allFilled = inlineInputs.every(input => input.value !== "");
        
            if (allFilled) {
              const userAnswers = inlineInputs.map(input => input.value.trim());
              const correctAnswers = inlineInputs.map(input => input.getAttribute("data-answer").trim());
              const allCorrect = userAnswers.every((answer, index) => answer === correctAnswers[index]);
        
              // If all answers are correct
              if (allCorrect) {
                setTimeout(() => {
                  currentQuestion++;
                  if (currentQuestion < questions.length) {
                    showQuestion();
                  } else {
                    result.innerHTML = `${questions.length}`;
                    quizContainer.innerHTML = "";
                  }
                }, 1000);
              } else { // If some answers are incorrect
                setTimeout(() => {
                  inlineInputs.forEach(input => {
                    input.value = "";
                  });
                  Array.from(question.querySelectorAll(".btn")).forEach(btn => {
                    btn.classList.remove("list-group-item-primary");
                    btn.classList.remove("list-group-item-danger");
                  });
                }, 3000);
              }
            }
          }
          break;
        
    }
}


  quizContainer.addEventListener("click", (event) => {
    const target = event.target;
    const question = target.closest(".question");
    const qtype = question.getAttribute("data-qtype");


    switch (qtype) {
      case "match":
        target.classList.add("list-group-item-secondary");
        // checkProgress(target);
        break;
      case "multiple-choice":
        if (target.tagName === "BUTTON") {
          const selectedIndex = Array.from(target.parentNode.children).indexOf(target);
          const correctAnswers = question.getAttribute("data-answers")
            .split(",")
            .map(Number);
          if (correctAnswers.includes(selectedIndex)) {
            target.classList.add("list-group-item-primary");
          } else {
            target.classList.add("list-group-item-danger");
          }
        }
        break;
      case "fill-in-the-blank":
        if (target.classList.contains("btn")) {
          const inlineInputs = Array.from(question.querySelectorAll(".form-control-inline"));
          const selectedOption = target.textContent;
          let blankInput = inlineInputs.find(input => input.value === "");
          if (blankInput) {
            // blankInput.value = selectedOption;
            // blankInput.classList.remove("blank");
            const correctAnswer = blankInput.getAttribute("data-answer");
            if (selectedOption === correctAnswer) {
              target.classList.add("list-group-item-primary");
              // blankInput.classList.remove("is-invalid");
            } else {
              target.classList.add("list-group-item-danger");
              // blankInput.classList.add("is-invalid");
            }
          }
        }
        if (target.classList.contains("form-control-inline")) {
          const selectedOption = target.value;
          target.value = "";
          target.classList.add("blank");
          const correspondingButton = Array.from(question.querySelectorAll(".btn"))
            .find(button => button.textContent === selectedOption);
          if (correspondingButton) {
            correspondingButton.classList.remove("list-group-item-primary");
          }
        }
        break;
    }
    checkProgress(target);
    quizContainer.classList.add(qtype);
  });

  // showQuestion();
  initQuestions();
});
